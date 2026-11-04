import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { createApp } from '../src/app';
import { connectDB } from '../src/config/db';
import { Admin } from '../src/models';
import { hashPassword } from '../src/services/auth.service';

export const ADMIN = { email: 'admin@example.com', password: 'Correct-Horse-42' };

/** Start an in-memory MongoDB for the file and wipe it between tests. */
export function useTestDb() {
  let mongo: MongoMemoryServer;
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await connectDB(mongo.getUri());
  });
  afterEach(async () => {
    const collections = await mongoose.connection.db!.collections();
    await Promise.all(collections.map((c) => c.deleteMany({})));
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
  });
}

export const app = createApp();
export const api = () => request(app);

export async function createAdmin() {
  return Admin.create({ email: ADMIN.email, passwordHash: await hashPassword(ADMIN.password) });
}

/** Log in and return the session cookie header. */
export async function loginCookie(): Promise<string[]> {
  await createAdmin();
  const res = await api().post('/api/auth/login').send(ADMIN).expect(200);
  return res.get('Set-Cookie') ?? [];
}
