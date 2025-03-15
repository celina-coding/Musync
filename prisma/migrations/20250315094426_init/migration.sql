-- CreateTable
CREATE TABLE "UserSharedPlaylist" (
    "user_shared_playlist_id" SERIAL NOT NULL,
    "playlist_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "UserSharedPlaylist_pkey" PRIMARY KEY ("user_shared_playlist_id")
);

-- CreateTable
CREATE TABLE "UserSharedMusic" (
    "user_shared_music_id" SERIAL NOT NULL,
    "music_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "UserSharedMusic_pkey" PRIMARY KEY ("user_shared_music_id")
);

-- CreateTable
CREATE TABLE "UserMusicPlatform" (
    "user_id" INTEGER NOT NULL,
    "token_account" TEXT NOT NULL,
    "music_media_id" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSharedPlaylist_user_id_key" ON "UserSharedPlaylist"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserSharedMusic_user_id_key" ON "UserSharedMusic"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserMusicPlatform_user_id_key" ON "UserMusicPlatform"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserMusicPlatform_music_media_id_key" ON "UserMusicPlatform"("music_media_id");
