import mongoose, { Types } from 'mongoose';
import httpStatus from 'http-status';
import Message from './message.model';
import AppError from '../../error/AppError';
import { IMessages } from './message.interface';
import Chat from '../chat/chat.model';
import { chatService } from '../chat/chat.service';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.models';

// // Add a new message
// const addMessage = async (messageBody: any) => {
//   const newMessage = await Message.create(messageBody);
//   return await newMessage.populate('chat sender');
// };

// // Get messages by chat ID with pagination
// const getMessages = async (chatId: any, options = {}) => {
//   const { limit = 10, page = 1 }: { limit?: number; page?: number } = options;

//   try {
//     const totalResults = await Message.countDocuments({ chat: chatId });
//     const totalPages = Math.ceil(totalResults / limit);
//     const pagination = { totalResults, totalPages, currentPage: page, limit };

//     // console.log([chatId]);

//     const skip = (page - 1) * limit;
//     const chat = new mongoose.Types.ObjectId(chatId);

//     const messages = await Message.aggregate([
//       { $match: { chat: chat } },
//       { $sort: { createdAt: -1 } },
//       { $skip: skip },
//       { $limit: limit },
//       {
//         $lookup: {
//           from: 'users',
//           localField: 'sender',
//           foreignField: '_id',
//           as: 'sender',
//         },
//       },
//       { $unwind: '$sender' },
//       {
//         $lookup: {
//           from: 'chats',
//           localField: 'chat',
//           foreignField: '_id',
//           as: 'chatDetails',
//         },
//       },
//       { $unwind: '$chatDetails' },
//       {
//         $project: {
//           _id: 1,
//           chat: 1,
//           message: 1,
//           type: 1,
//           sender: {
//             _id: 1,
//             fullName: 1,
//             image: 1,
//           },
//           createdAt: 1,
//           updatedAt: 1,
//         },
//       },
//     ]);

//     // console.log('messages', messages);

//     return { messages, pagination };
//   } catch (error) {
//     throw new AppError(
//       httpStatus.INTERNAL_SERVER_ERROR,
//       'Failed to retrieve messages',
//     );
//   }
// };

// const getMessageById = async (messageId: Types.ObjectId) => {
//   return Message.findById(messageId).populate('chat');
// };

// // Delete a message by ID
// const deleteMessage = async (id: string) => {
//   const result = await Message.findByIdAndDelete(id);
//   if (!result) {
//     throw new AppError(httpStatus.NOT_FOUND, 'Message not found');
//   }
//   return result;
// };

// // Delete messages by chat ID
// const deleteMessagesByChatId = async (chatId: string) => {
//   const result = await Message.deleteMany({ chat: chatId });
//   if (!result) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'Failed to delete messages');
//   }
//   return result;
// };


//------------------------------------------------------//

//------------------------------------------------------//

const createMessages = async (payload: IMessages) => {
  // console.log('payload===', payload);

  if(payload.receiver){
    if (payload.sender.toString() === payload.receiver.toString()) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Sender and Receiver cannot be the same person. Please change.',
      );
    }
    const alreadyExists = await Chat.findOne({
      participants: { $all: [payload.sender, payload.receiver] },
    }).populate(['participants']);
    console.log('alreadyExists', alreadyExists);

    if (!alreadyExists) {
      const chatList = await Chat.create({
        participants: [payload.sender, payload.receiver],
      });
      //@ts-ignore
      payload.chat = chatList?._id;
    } else {
      //@ts-ignore
      payload.chat = alreadyExists?._id;
    }

  }

  if (payload.chat) {
  const  chat = await Chat.findById(payload.chat);
    if (!chat) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Chat is not found!!');
    }

    const receiver =
      chat &&
      chat.participants.find(
        (id) => id.toString() !== payload.sender.toString(),
      );

    console.log('receiver==', receiver);

    if (!receiver) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Recever is not found!!');
    }
    payload.receiver = receiver;

    if (payload.sender.toString() === receiver._id.toString()) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Sender and Receiver cannot be the same person. Please change.',
      );
    }
  }


 

  console.log('payload khela hobe', payload);

  const sender = await User.findById(payload.sender);
  // console.log('sender==', sender);

  if (!sender) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Sender is not found!!');
  }
  

  
 

  console.log('payload last part', payload);



  const alreadyExists = await Chat.findOne({
    participants: { $all: [payload.sender, payload.receiver] },
  }).populate(['participants']);

  if (!alreadyExists) {
    const chatList = await Chat.create({
      participants: [payload.sender, payload.receiver],
    });
    // console.log(' exist nah');
    //@ts-ignore
    payload.chatId = chatList?._id;
  } else {
    // console.log('already exist');
    //@ts-ignore
    payload.chatId = alreadyExists?._id;
  }



console.log('payload==2', payload);
   const result = await(await Message.create(payload)).populate([
     {
       path: 'sender',
       select: 'fullName email image role _id phone'
     },
   ]);
  console.log('result', result);
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Message creation failed');
  }

  if (io) {
    console.log('socket hit hoise!')
    const senderMessage = 'new-message::' + result.chat.toString();
    console.log('senderMessage', senderMessage);

    io.emit(senderMessage, result);

   
    const ChatListSender = await chatService.getMyChatList(
      result?.sender._id.toString(),
    );
    const ChatListReceiver = await chatService.getMyChatList(
      result?.receiver._id.toString(),
    );

    console.log('ChatListSender', ChatListSender);
    console.log('ChatListReceiver', ChatListReceiver);

    const senderChat = 'chat-list::' + result.sender._id.toString();
    const receiverChat = 'chat-list::' + result.receiver._id.toString();
    console.log('senderChat', senderChat);
    console.log('receiverChat', receiverChat);
    io.emit(receiverChat, ChatListReceiver);
    io.emit(senderChat, ChatListSender);
  }

  return result;
};

// Get all messages
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getAllMessages = async (query: Record<string, any>) => {
  const MessageModel = new QueryBuilder(
    Message.find().populate([
      {
        path: 'sender',
        select: 'name email image role _id phone ',
      },
      {
        path: 'receiver',
        select: 'name email image role _id phone ',
      },
    ]),
    query,
  )
    .filter()
    // .paginate()
    .sort()
    .fields();

  const data = await MessageModel.modelQuery;
  const meta = await MessageModel.countTotal();
  return {
    data,
    meta,
  };
};

// Update messages
const updateMessages = async (id: string, payload: Partial<IMessages>) => {
  const result = await Message.findByIdAndUpdate(id, payload, { new: true });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Message update failed');
  }
  return result;
};

// Get messages by chat ID
const getMessagesByChatId1 = async (chatId: string) => {
  console.log('chatId', chatId);
  //pagination
  const result = await Message.find({ chat: chatId })
    .populate('taskId')
    .sort({ createdAt: -1 });
  return result;
};


const getMessagesByChatId = async (
  query: Record<string, unknown>,
  chatId: string,
) => {
  query.sort = '-createdAt';
  const TaskPostQuery = new QueryBuilder(
    Message.find({ chat: chatId }).populate('taskId').populate({
      path: 'sender',
      select: 'fullName image role',
    }),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await TaskPostQuery.modelQuery;
  const sorted = result
    .filter((item) => item.type === 'task') // ensure updatedAt exists
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

  const lastUpdatedData = sorted[0];



  const meta = await TaskPostQuery.countTotal();
  return { meta, result, lastUpdatedData };
};

// Get message by ID
const getMessagesById = async (id: string) => {
  const result = await Message.findById(id).populate([
    {
      path: 'sender',
      select: 'name email image role _id phoneNumber ',
    },
    {
      path: 'receiver',
      select: 'name email image role _id phoneNumber ',
    },
  ]);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Oops! Message not found');
  }
  return result;
};

const deleteMessages = async (id: string) => {
  const message = await Message.findById(id);
  if (!message) {
    throw new AppError(httpStatus.NOT_FOUND, 'Oops! Message not found');
  }
  // if (message?.imageUrl) {
  //   await deleteFromS3(
  //     `images/messages/${message?.chat.toString()}/${message?.id}`,
  //   );
  // }

  const result = await Message.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Oops! Message not found');
  }
  return result;
};

const seenMessage = async (userId: string, chatId: string) => {
  console.log('userId', userId);
  console.log('chatId', chatId);
  const chatIdObj = new mongoose.Types.ObjectId(chatId);
  const userIdObj = new mongoose.Types.ObjectId(userId);
  const messageIdList = await Message.aggregate([
    {
      $match: {
        chat: chatIdObj,
        seen: false,
        sender: { $ne: userIdObj },
      },
    },
    { $group: { _id: null, ids: { $push: '$_id' } } },
    { $project: { _id: 0, ids: 1 } },
  ]);
  console.log('messageIdList', messageIdList);
  const unseenMessageIdList =
    messageIdList.length > 0 ? messageIdList[0].ids : [];
console.log('unseenMessageIdList', unseenMessageIdList);
  const updateMessages = await Message.updateMany(
    { _id: { $in: unseenMessageIdList } },
    { $set: { seen: true } },
  );
  console.log('updateMessages', updateMessages);
  return updateMessages;
};

// Export all methods in the same format as the old structure
export const messageService = {
  // addMessage,
  // getMessageById,
  // getMessages,
  // deleteMessage,
  // deleteMessagesByChatId,
  createMessages,
  getAllMessages,
  getMessagesByChatId,
  getMessagesById,
  updateMessages,
  deleteMessages,
  seenMessage,
};
