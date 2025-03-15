/*
  Warnings:

  - Changed the type of `music_media_id` on the `UserMusicPlatform` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "MusicPlatform" AS ENUM ('SPOTIFY', 'APPLE_MUSIC');

-- DropIndex
DROP INDEX "UserMusicPlatform_music_media_id_key";

-- AlterTable
ALTER TABLE "UserMusicPlatform" DROP COLUMN "music_media_id",
ADD COLUMN     "music_media_id" "MusicPlatform" NOT NULL;
