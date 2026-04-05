import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env.local') });

/**@type { import("drizzle-kit").Config }*/
export default {
  schema: "./utils/schema.js",
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.NEXT_PUBLIC_DRIZZLE_DB_URL,
  }
};

