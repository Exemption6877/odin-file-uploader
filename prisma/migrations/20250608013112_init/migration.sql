/*
  Warnings:

  - Added the required column `type` to the `Files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Files" ADD COLUMN     "type" TEXT NOT NULL;
