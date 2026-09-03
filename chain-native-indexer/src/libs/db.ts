import { PrismaClient } from "@prisma/client";
import logger from "./logger";

const prisma = new PrismaClient();

async function connectToDatabase() {
  try {
    await prisma.$connect();
    logger.info("Database connected");
  } catch (error) {
    logger.error("Connection failed:", error);
  }
}

export { prisma, connectToDatabase };
