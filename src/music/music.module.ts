import { Module } from "@nestjs/common";
import { MusicController } from "./music.controller";
import { MusicService } from "./music.service";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [HttpModule, ConfigModule.forRoot()],
    controllers: [MusicController],
    providers: [MusicService],
})
export class MusicModule {}   