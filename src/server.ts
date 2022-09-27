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

dotenv.config();

db();
const app: Express = express();

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

app.use(logger);
app.use(errorHandler);

const PORT = sanitizedConfig.PORT || 5000;

// running the express server success
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () =>
    console.log(
      `🟢 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
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
