import mongoose from 'mongoose';
import sanitizedConfig from './config/config';

//connect to database (mongodb using ORM mongoose)
const db = async () => {
  try {
    const connection = await mongoose.connect(sanitizedConfig.MONGO_URI);
    console.log(`🟢 Mongo db connected:`, connection.connection.host);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export default db;
