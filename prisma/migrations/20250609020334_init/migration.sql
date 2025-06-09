/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `Files` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,title]` on the table `Folders` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Files_userId_name_key" ON "Files"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Folders_userId_title_key" ON "Folders"("userId", "title");
