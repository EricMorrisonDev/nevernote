/*
  Warnings:

  - A unique constraint covering the columns `[id,userId]` on the table `stacks` will be added. If there are existing duplicate values, this will fail.
  - Made the column `notebookId` on table `notes` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "notes_userId_idx";

-- AlterTable
ALTER TABLE "notes" ALTER COLUMN "notebookId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "notes_userId_title_idx" ON "notes"("userId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "stacks_id_userId_key" ON "stacks"("id", "userId");
