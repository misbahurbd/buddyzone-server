/*
  Warnings:

  - You are about to drop the column `postId` on the `comment_reactions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "comment_reactions" DROP CONSTRAINT "comment_reactions_postId_fkey";

-- AlterTable
ALTER TABLE "comment_reactions" DROP COLUMN "postId";

-- CreateTable
CREATE TABLE "post_medias" (
    "id" TEXT NOT NULL,
    "publicId" VARCHAR(255) NOT NULL,
    "url" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_medias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "post_medias_publicId_key" ON "post_medias"("publicId");

-- CreateIndex
CREATE INDEX "post_medias_postId_idx" ON "post_medias"("postId");

-- AddForeignKey
ALTER TABLE "post_medias" ADD CONSTRAINT "post_medias_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
