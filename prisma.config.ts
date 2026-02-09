import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';
import path from 'path';

// Force load .env from the current directory
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing from .env');
}

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
