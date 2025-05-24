import { Module } from "@nestjs/common";
import { MusicController } from "./music.controller";
import { MusicService } from "./music.service";
import { HttpModule } from "@nestjs/axios";
import { ConfigModule } from "@nestjs/config";
import { KafkaModule } from "src/kafka/kafka.module";
import { KeycloakConnectModule } from "nest-keycloak-connect";
import { keycloakConfig } from "./auth/keycloak.config";

@Module({
    imports: [HttpModule, ConfigModule.forRoot(), KafkaModule,KeycloakConnectModule.register(keycloakConfig)],
    controllers: [MusicController],
    providers: [MusicService],
})
export class MusicModule {}   