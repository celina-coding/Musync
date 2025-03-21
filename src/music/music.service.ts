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

    // Cette fonction nous permet de récupérer les type de media de l'utilisateur
    // Cette fonction sera appelée dans queleques fonctions de notre service ce qui aide a factoriser notre code
    async getUserMedia(userId: number){

        const userMedia = await this.prisma.userMusicPlatform.findUnique({
            where: {user_id: userId},
        });

        if(userMedia){
            return userMedia.music_media_id;
        }
        else{
            return {error: "User media not found"};
        }


    }


    async getUserMediaToken(userId: number){

        const userMedia = await this.prisma.userMusicPlatform.findUnique({
            where: {user_id: userId},
        });

        if(!userMedia || !userMedia.token_account){
            return {error: "User media not found"};
        }

        return userMedia.token_account;
    }

    // Cette fonction permet d'envoyer une requete à une de nos API
    async sendRequestToAPI(request: { url: string }, userId: number) {
        const userMediaName = await this.getUserMedia(userId);
    
        if (userMediaName === MusicPlatform.SPOTIFY) {
            return this.sendRequestToSpotify(request, userId);
        } else if (userMediaName === MusicPlatform.APPLE_MUSIC) {
            return this.sendRequestToAppleMusic(request, userId);
        } else {
            throw new Error("Media not supported");
        }
    }

    // Cette fonction permet à l'utilisateur d'envoyer une requete à Spotify API
    async sendRequestToSpotify(request: { url: string }, userId: number) {
        const userToken = await this.getUserMediaToken(userId);

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

    // Cette fonction permet à l'utilisateur de partager une playlist avec les autres utilisateurs
    async postUserSharedPlaylist(userId: number, playlistId: string){
        const playlistAlreadyShared = await this.prisma.userSharedPlaylist.findFirst({
            where: {
                user_id: userId,
                playlist_id: playlistId,
            }
        });
        if(playlistAlreadyShared){
            throw new Error('Playlist already shared');
        }
        console.log("playlist shared ...");
        const playlistToAdd = await this.prisma.userSharedPlaylist.create({
            data: {
                playlist_id: playlistId,
                user_id: userId,
            },
        });
        return playlistToAdd;
    }

    async getUserSharedPlaylist(userId: number, playlistId: string){
        
        const sharedPlaylist = await this.prisma.userSharedPlaylist.findUnique({
            where: {user_id: userId,
                    playlist_id: playlistId},
        });

        if(!sharedPlaylist){
            return {error: "Playlist not found"};
        }

        //On récupère la plateforme de musique de l'utilisateur
        const userMedia = await this.getUserMedia(userId);

        //On récupère le token de l'utilisateur
        const userToken = await this.getUserMediaToken(userId);

        let apiUrl: string;
        let headers: Record<string, string>;

       //On vérifie si l'utilisateur s'est connecté à Spotify ou à  Apple Music
        switch(userMedia){
            case MusicPlatform.SPOTIFY:
                apiUrl = `https://api.spotify.com/v1/playlists/${sharedPlaylist.playlist_id}`;
                headers = {
                    Authorization: `Bearer ${userToken}`,
                };                  
                break;
            case MusicPlatform.APPLE_MUSIC:
                throw new Error("Apple Music API is not yet supported");    
                break;
            default:
                throw new Error("Media not supported");    
        }

        const response = await firstValueFrom(
            this.httpService.get(apiUrl,{headers}),
        );

        return response.data;
    }

    
    async getUserSharedPlaylists(userId: number){}
   

    async postUserSharedMusic(userId: number, musicId: number){}
    async getUserSharedMusics(userId: number){}
    async getUserSharedMusic(userId: number, musicId: number){}
  
    
    
    
}