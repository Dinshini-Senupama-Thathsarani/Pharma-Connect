import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env';


dns.setServers(['8.8.8.8', '1.1.1.1']);

export const connectDB = async (): Promise<void> => {
  await mongoose.connect(env.mongoUri);
  console.log('MongoDB connected');
};