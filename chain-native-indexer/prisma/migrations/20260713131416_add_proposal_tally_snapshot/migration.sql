-- AlterTable
ALTER TABLE "Proposals" ADD COLUMN     "abstainPercent" TEXT,
ADD COLUMN     "bondedTokens" TEXT,
ADD COLUMN     "isFinalized" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "noPercent" TEXT,
ADD COLUMN     "totalVotes" TEXT,
ADD COLUMN     "turnout" TEXT,
ADD COLUMN     "vetoPercent" TEXT,
ADD COLUMN     "yesPercent" TEXT;
