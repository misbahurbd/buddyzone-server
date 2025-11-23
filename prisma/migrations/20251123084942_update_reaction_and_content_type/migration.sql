/*
  Warnings:

  - The values [DISLIKE] on the enum `ReactionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReactionType_new" AS ENUM ('LIKE', 'LOVE', 'CARE', 'HAHA', 'WOW', 'SAD', 'ANGRY');
ALTER TABLE "public"."comment_reactions" ALTER COLUMN "reactionType" DROP DEFAULT;
ALTER TABLE "public"."post_reactions" ALTER COLUMN "reactionType" DROP DEFAULT;
ALTER TABLE "post_reactions" ALTER COLUMN "reactionType" TYPE "ReactionType_new" USING ("reactionType"::text::"ReactionType_new");
ALTER TABLE "comment_reactions" ALTER COLUMN "reactionType" TYPE "ReactionType_new" USING ("reactionType"::text::"ReactionType_new");
ALTER TYPE "ReactionType" RENAME TO "ReactionType_old";
ALTER TYPE "ReactionType_new" RENAME TO "ReactionType";
DROP TYPE "public"."ReactionType_old";
ALTER TABLE "comment_reactions" ALTER COLUMN "reactionType" SET DEFAULT 'LIKE';
ALTER TABLE "post_reactions" ALTER COLUMN "reactionType" SET DEFAULT 'LIKE';
COMMIT;

-- AlterTable
ALTER TABLE "comments" ALTER COLUMN "content" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "content" SET DATA TYPE TEXT;
