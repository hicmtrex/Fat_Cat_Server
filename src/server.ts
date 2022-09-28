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
import path from 'path';

//access .env file
dotenv.config({
  path: path.resolve(__dirname, '/.env'),
});
const app: Express = express();
db();

//enable middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:3000'],
    credentials: true,
  })
);

if (sanitizedConfig.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//routes
app.use('/api/auth', authRoutes);

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
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () =>
    console.log(
      `🟢 Server running in ${sanitizedConfig.NODE_ENV} mode on port ${PORT}`
    )
  );
});

// running the express server fail
mongoose.connection.on('error', (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    'mongoErrLog.log'
  );
});
