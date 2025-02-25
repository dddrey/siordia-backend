/*
  Warnings:

  - You are about to drop the `UserLesson` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserTopic` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserLesson" DROP CONSTRAINT "UserLesson_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "UserLesson" DROP CONSTRAINT "UserLesson_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserTopic" DROP CONSTRAINT "UserTopic_topicId_fkey";

-- DropForeignKey
ALTER TABLE "UserTopic" DROP CONSTRAINT "UserTopic_userId_fkey";

-- DropTable
DROP TABLE "UserLesson";

-- DropTable
DROP TABLE "UserTopic";
