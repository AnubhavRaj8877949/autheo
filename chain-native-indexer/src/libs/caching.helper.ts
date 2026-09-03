import { REDIS_KEY } from "../constant/index";
import { RedisService } from "../services";
import { prisma } from "./db";

class CachingHelper {
  async initializeCount() {
    const blockCount = await prisma.blocks.count();
    if (blockCount) {
      RedisService.setString(REDIS_KEY.NATIVE_BLOCKS_COUNT, blockCount);
    }
    const txCount = await prisma.transactions.count();
    if (txCount) {
      RedisService.setString(REDIS_KEY.NATIVE_TRANSACTIONS_COUNT, txCount);
    }
  }
}
export default new CachingHelper();
