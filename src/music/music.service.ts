import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { HttpService } from "@nestjs/axios";
import { MusicPlatform } from "@prisma/client";
import { error } from "console";
import { firstValueFrom } from "rxjs";


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

    // Cette fonction permet d'envoyer une requete à ne de nos API
    async sendRequestToAPI(request: { url: string }, userId: number) {
        const userMediaName = await this.prisma.userMusicPlatform.findUnique({
            where: { user_id: userId },
        });
    
        if (!userMediaName) {
            return { error: "User media not found" };
        }
    
        if (userMediaName.music_media_id === MusicPlatform.SPOTIFY) {
            return this.sendRequestToSpotify(request, userId);
        } else if (userMediaName.music_media_id === MusicPlatform.APPLE_MUSIC) {
            return this.sendRequestToAppleMusic(request, userId);
        } else {
            throw new Error("Media not supported");
        }
    }
    
    async sendRequestToSpotify(request: { url: string }, userId: number) {
        const user = await this.prisma.userMusicPlatform.findUnique({
            where: { user_id: userId },
        });
        const userToken = user?.token_account;
    
        if (!userToken) {
            throw new Error("User token not found");
        }
    
        const response = await firstValueFrom(
            this.httpService.get(request.url, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            }),
        );
        return response.data;
    }

    //"id": "31rdjvjkwafuebc5xtpvutfmlzju",

    // Cette fonction permet à l'utilisateur d'envoyer une requete à Apple Music API
    async sendRequestToAppleMusic(request: { url: string }, userId: number) {
        throw new error("The Apple Music API is not yet supported");
    }

    async postUserSharedMusic(userId: number, musicId: number){}
    async postUserSharedPlaylist(userId: number, playlistId: number){}


    async getUserSharedPlaylists(userId: number){}
    async getUserSharedPlaylist(userId: number, playlistId: number){}
    async getUserSharedMusics(userId: number){}
    async getUserSharedMusic(userId: number, musicId: number){}
    async getUserMedia(userId: number){}
    async getUserMediaToken(userId: number){}
    
    
    
}