import { Module } from '@nestjs/common';
import { MusicModule } from './music/music.module';
import { AuthModule } from './music/auth/auth.model';
import { PrismaModule } from './music/prisma/prisma.module';


@Module({
  imports: [MusicModule, AuthModule, PrismaModule],

})
export class AppModule {}
