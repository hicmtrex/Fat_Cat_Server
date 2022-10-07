import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import sanitizedConfig from './utils/config/config';
import db from './utils/db';
import mongoose from 'mongoose';
import { logEvents, logger } from './middleware/logger';
import { errorHandler } from './middleware/error';
import authRoutes from './routes/auth';
import messageRoutes from './routes/message';
import chatRoutes from './routes/chat';
import userRoutes from './routes/user';
import path from 'path';
import { Server, Socket } from 'socket.io';
import http from 'http';

//access .env file
dotenv.config({
  path: path.resolve(__dirname, '/.env'),
});
const app: Express = express();
const server = http.createServer(app);
db();

//enable middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [sanitizedConfig.FRONT_URL],
    credentials: true,
  })
);

if (sanitizedConfig.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/chat', chatRoutes);

// default view templet
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// default error templet
app.all('*', (req: Request, res: Response) => {
  res.status(404);
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({ message: '404 Not Found' });
  } else {
    res.type('txt').send('404 Not Found');
  }
});

//costom middlewares
app.use(logger);
app.use(errorHandler);

const PORT = sanitizedConfig.PORT || 5000;

// running the express server success

server.listen(PORT, () =>
  console.log(
    `🟢 Server running in ${sanitizedConfig.NODE_ENV} mode on port ${PORT}`
  )
);

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: [sanitizedConfig.FRONT_URL],
    credentials: true,
  },
});

//realtime data with socket io
io.on('connection', (socket: Socket) => {
  console.log('🟢 Connected to socket.io');
  //join room

  socket.on('setup', (userData) => {
    socket.join(userData._id);
    socket.emit('🟢 connected');
  });

  //join chat
  socket.on('join chat', (room) => {
    socket.join(room);
    console.log('👤 User Joined Room: ' + room);
  });

  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

  //send new message
  socket.on('new message', (newMessageRecieved) => {
    let chat = newMessageRecieved.chat;

    if (!chat.users) return console.log('chat.users not defined');

    chat.users.forEach((user: any) => {
      if (user._id == newMessageRecieved.sender._id) return;
      // recived message
      socket.in(user._id).emit('message recieved', newMessageRecieved);
    });
  });

  socket.off('setup', (userData) => {
    console.log('🔴 USER DISCONNECTED');
    socket.leave(userData._id);
  });
});
