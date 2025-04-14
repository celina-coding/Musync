import { Module } from "@nestjs/common";
import { MusicController } from "./music.controller";
import { MusicService } from "./music.service";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import { KafkaModule } from "src/kafka/kafka.module";

@Module({
    imports: [HttpModule, ConfigModule.forRoot(), KafkaModule],
    controllers: [MusicController],
    providers: [MusicService],
})
export class MusicModule {}   