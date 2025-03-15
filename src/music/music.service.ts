import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { HttpService } from "@nestjs/axios";
import { MusicPlatform } from "@prisma/client";


@Injectable({})
export class MusicService{
    constructor(
        private prisma: PrismaService,
        private httpService: HttpService,
    ){}

    // Cette fonction permet de stocker la plateforme de musique de l'utilisateur ainsi que son token lorsqu'il se connecte
    async setUserMedia(userId: number, tokenAccount: string, mediaName: string){
        const user = await this.prisma.userMusicPlatform.findUnique({
            where: {user_id: userId},
        });

        if(user){
            console.log("Updating user media");
        }else{
            console.log("Creating user media");
        }

        const userMedia = await this.prisma.userMusicPlatform.upsert({
            where: { user_id: userId },
            update: {token_account: tokenAccount, music_media_id: mediaName as MusicPlatform},
            create: {user_id: userId, token_account: tokenAccount, music_media_id: mediaName as MusicPlatform},
        })
        
        return userMedia;
    }




    async sendRequestToAPI(request: string, userId: number){}
    async sendRequestToSpotify(request: Request, userId: number){}
    async sendRequestToAppleMusic(request: Request, userId: number){}

    async postUserSharedMusic(userId: number, musicId: number){}
    async postUserSharedPlaylist(userId: number, playlistId: number){}


    async getUserSharedPlaylists(userId: number){}
    async getUserSharedPlaylist(userId: number, playlistId: number){}
    async getUserSharedMusics(userId: number){}
    async getUserSharedMusic(userId: number, musicId: number){}
    async getUserMedia(userId: number){}
    async getUserMediaToken(userId: number){}
    
    
    
}