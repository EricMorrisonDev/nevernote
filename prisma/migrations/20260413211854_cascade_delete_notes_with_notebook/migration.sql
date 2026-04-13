-- DropForeignKey
ALTER TABLE "notes" DROP CONSTRAINT "notes_notebookId_fkey";

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_notebookId_fkey" FOREIGN KEY ("notebookId") REFERENCES "notebooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
