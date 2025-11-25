/*
  Warnings:

  - The primary key for the `comment_reactions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `post_reactions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[authorId,commentId]` on the table `comment_reactions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[authorId,postId]` on the table `post_reactions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "comment_reactions" DROP CONSTRAINT "comment_reactions_pkey",
ADD COLUMN     "id" TEXT;

-- AlterTable
ALTER TABLE "post_reactions" DROP CONSTRAINT "post_reactions_pkey",
ADD COLUMN     "id" TEXT;

-- CreateIndex
CREATE INDEX "comment_reactions_authorId_idx" ON "comment_reactions"("authorId");

-- CreateIndex
CREATE INDEX "comment_reactions_commentId_idx" ON "comment_reactions"("commentId");

-- CreateIndex
CREATE INDEX "comment_reactions_authorId_commentId_idx" ON "comment_reactions"("authorId", "commentId");

-- CreateIndex
CREATE UNIQUE INDEX "comment_reactions_authorId_commentId_key" ON "comment_reactions"("authorId", "commentId");

-- CreateIndex
CREATE INDEX "post_reactions_authorId_idx" ON "post_reactions"("authorId");

-- CreateIndex
CREATE INDEX "post_reactions_postId_idx" ON "post_reactions"("postId");

-- CreateIndex
CREATE INDEX "post_reactions_authorId_postId_idx" ON "post_reactions"("authorId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "post_reactions_authorId_postId_key" ON "post_reactions"("authorId", "postId");
