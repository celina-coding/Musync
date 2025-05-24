import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { HttpModule } from "@nestjs/axios";
import { AuthService } from "./auth.serice";
import { PrismaService } from "../prisma/prisma.service";
import { KafkaService } from "src/kafka/kafka.service";
import { KeycloakConnectModule } from "nest-keycloak-connect";
import { keycloakConfig } from "./keycloak.config";

@Module({
    imports: [HttpModule],
    controllers: [AuthController],
    providers: [AuthService, PrismaService, KafkaService],
    exports: [AuthService]
})
export class AuthModule{}