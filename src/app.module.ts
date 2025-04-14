import { Module } from '@nestjs/common';
import { MusicModule } from './music/music.module';
import { AuthModule } from './music/auth/auth.model';
import { PrismaModule } from './music/prisma/prisma.module';
import { KafkaModule } from './kafka/kafka.module';


@Module({
  imports: [MusicModule, AuthModule, PrismaModule, KafkaModule],

})
export class AppModule {}
