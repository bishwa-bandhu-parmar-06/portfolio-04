import mongoose from 'mongoose';
import { env, isProd } from './env';

// Strips `$`-prefixed operators out of query filters built from user input.
mongoose.set('sanitizeFilter', true);
mongoose.set('strictQuery', true);

export async function connectDB(uri = env.MONGODB_URI): Promise<void> {
  await mongoose.connect(uri, {
    autoIndex: !isProd,
    serverSelectionTimeoutMS: 10_000,
  });
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
