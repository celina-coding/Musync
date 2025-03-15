/*
  Warnings:

  - A unique constraint covering the columns `[music_id]` on the table `UserSharedMusic` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[playlist_id]` on the table `UserSharedPlaylist` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserSharedMusic_music_id_key" ON "UserSharedMusic"("music_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserSharedPlaylist_playlist_id_key" ON "UserSharedPlaylist"("playlist_id");
