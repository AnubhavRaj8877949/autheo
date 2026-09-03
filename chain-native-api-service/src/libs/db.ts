import { PrismaClient } from "@prisma/client";
import logger from "./logger";

const prisma = new PrismaClient();

prisma
  .$connect()
  .then(() => {
    logger.info("Database connected");
  })
  .catch((error) => {
    logger.error("Error connecting to database", { error });
  });

process.on("beforeExit", async () => {
  logger.info("Database disconnecting");
  await prisma.$disconnect();
});

export default prisma;
