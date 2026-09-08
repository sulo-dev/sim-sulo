import { config } from "dotenv";

// Mengeksekusi pembacaan file .env secara eksplisit
config();

export default {
  datasource: {
    url: process.env.DATABASE_URL,
  },
};