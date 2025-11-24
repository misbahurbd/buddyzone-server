/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `post_medias` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "post_medias_url_key" ON "post_medias"("url");

-- CreateIndex
CREATE INDEX "post_medias_publicId_idx" ON "post_medias"("publicId");
