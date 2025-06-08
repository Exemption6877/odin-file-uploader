/*
  Warnings:

  - You are about to drop the column `link` on the `Files` table. All the data in the column will be lost.
  - Added the required column `name` to the `Files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `Files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Files" DROP COLUMN "link",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL;
