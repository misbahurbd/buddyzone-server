/*
  Warnings:

  - The primary key for the `comment_reactions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `comment_reactions` table. All the data in the column will be lost.
  - The primary key for the `post_reactions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `post_reactions` table. All the data in the column will be lost.
  - Added the required column `authorId` to the `comment_reactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorId` to the `post_reactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "comment_reactions" DROP CONSTRAINT "comment_reactions_userId_fkey";

-- DropForeignKey
ALTER TABLE "post_reactions" DROP CONSTRAINT "post_reactions_userId_fkey";

-- AlterTable
ALTER TABLE "comment_reactions" DROP CONSTRAINT "comment_reactions_pkey",
DROP COLUMN "userId",
ADD COLUMN     "authorId" TEXT NOT NULL,
ADD CONSTRAINT "comment_reactions_pkey" PRIMARY KEY ("authorId", "commentId");

-- AlterTable
ALTER TABLE "post_reactions" DROP CONSTRAINT "post_reactions_pkey",
DROP COLUMN "userId",
ADD COLUMN     "authorId" TEXT NOT NULL,
ADD CONSTRAINT "post_reactions_pkey" PRIMARY KEY ("authorId", "postId");

-- AddForeignKey
ALTER TABLE "post_reactions" ADD CONSTRAINT "post_reactions_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_reactions" ADD CONSTRAINT "comment_reactions_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
