"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { socketVerifyToken } from './app/helpers/socketVerifyToken';
// import { handleChatEvents } from './app/modules/socket/events/chatEvents';
// import { handleMessageEvents } from './app/modules/socket/events/messageEvents';
const socketIO = (io) => {
    // Initialize an object to store the active users
    const userSocketMap = {};
    const getReceiverSocketId = (receiverId) => {
        return userSocketMap[receiverId];
    };
    // On new socket connection
    io.on('connection', (socket) => {
        // console.log('connected');
        // // console.log('socket decodedToken', socket.decodedToken);
        try {
            // // console.log('socket ---', socket);
            // // console.log('socket ---', data);
            //  if (userId && userId !== 'undefined') {
            //    userSocketMap[userId] = socket.id;
            //  }
            //  io.emit('active-users', Object.keys(userSocketMap));
            // // console.log('activeUsers down', userSocketMap);
            // Handle 'add-new-chat' event
            // socket.on('add-new-chat', (data, callback) =>
            //   handleChatEvents(socket, data, callback),
            // );
            // // Handle other events, like 'add-new-message'
            // socket.on('add-new-message', (data, callback) =>
            //   handleMessageEvents(socket, data, callback, io),
            // );
            // socket.on('disconnect', () => {
            //   if (userId) {
            //     delete userSocketMap[userId];
            //   }
            //   io.emit('getOnlineUsers', Object.keys(userSocketMap));
            // });
            // Other socket events...
        }
        catch (error) {
            console.error('Error in socket connection:', error);
        }
    });
};
exports.default = socketIO;
