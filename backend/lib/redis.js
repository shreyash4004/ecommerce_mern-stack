process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { Redis } from "@upstash/redis";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";


const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

export const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

(async () => {
  await redis.set("welcome", "Hello from Upstash Redis!");
  const value = await redis.get("welcome");
  console.log("Redis value:", value);
})();

