-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "roomId" TEXT;

-- CreateIndex
CREATE INDEX "Message_roomId_idx" ON "Message"("roomId");
