import { createServer, Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import socketIO from './socketio';
import { Server as SocketIOServer } from 'socket.io';
import colors from 'colors';
import config from './app/config';
import { createSuperAdmin } from './app/DB';

let server: Server;
const socketServer = createServer();

const io: SocketIOServer = new SocketIOServer(socketServer, {
  cors: {
    origin: '*',
  },
});

// async function main() {
//   try {
//     // console.log('config.database_url', config.database_url);

//     // await mongoose.connect(config.database_url as string);
//     await mongoose.connect(
//       'mongodb+srv://taskmanager:taskmanagerPass@cluster0.jz4eg.mongodb.net/taskmanagerApp?retryWrites=true&w=majority&appName=Cluster0'
//     );

//     server = app.listen(Number(config.port), () => {
//       console.log(
//         colors.green(`App is listening on ${config.ip}:${config.port}`).bold,
//       );
//     });

//     socketServer.listen(config.socket_port || 6000, () => {
//       console.log(
//         colors.yellow(
//           `Socket is listening on ${config.ip}:${config.socket_port}`,
//         ).bold,
//       );
//     });

//     socketIO(io);
//     global.io = io;
//   } catch (err) {
//     console.error('Error starting the server:', err);
//     process.exit(1);
//   }
// }

async function main() {
  try {
    // Connect to MongoDB
    // await mongoose.connect(config.database_url as string);
 

    // Create a single HTTP server from the Express app
    server = createServer(app);

    // Attach Socket.IO to the same HTTP server
    const io: SocketIOServer = new SocketIOServer(server, {
      cors: {
        origin: '*',
      },
    });

    // Start listening on the same port for both HTTP and WebSocket
    server.listen(Number(config.port), () => {
      console.log(
        colors.green(
          `Server (HTTP + Socket.IO) is running on ${config.ip}:${config.port}`,
        ).bold,
      );
    });

    await createSuperAdmin();
    // Initialize your Socket.IO handlerssu
    socketIO(io);

    // Optionally make the socket server globally accessible
    global.io = io;
  } catch (err) {
    console.error('Error starting the server:', err);
    process.exit(1);
  }
}

main();

// Graceful shutdown for unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled rejection detected: ${err}`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

// Graceful shutdown for uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught exception detected: ${err}`);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
});
