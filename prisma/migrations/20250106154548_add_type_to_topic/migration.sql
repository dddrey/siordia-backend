/*
  Warnings:

  - Added the required column `type` to the `Topic` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Topic" ADD COLUMN     "type" "ContentType" NOT NULL;
