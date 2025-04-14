import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { HttpService } from "@nestjs/axios";
import { MusicPlatform } from "@prisma/client";
import { error, timeStamp } from "console";
import { firstValueFrom } from "rxjs";
import { SetMediaDto } from "./dto";
import { KafkaService } from "src/kafka/kafka.service";


@Injectable({})
export class MusicService{
    constructor(
        private prisma: PrismaService,
        private httpService: HttpService,
        private kafkaService: KafkaService,
    ){}

    //Consommer les message des informations des utilisateurs
    async onModuleInit(){
        await this.kafkaService.consume('user-music-platform', 'music-service', async (message) => {
            console.log("Message received from Kafka:", message);
            const { userId, tokenAccount, mediaName } = message;
            await this.setUserMedia({ userId, tokenAccount, mediaName });
            console.log("User media set successfully");
        });
    }

    // Cette fonction permet de stocker la plateforme de musique de l'utilisateur ainsi que son token lorsqu'il se connecte
    async setUserMedia(dto: SetMediaDto) {
        const { userId, tokenAccount, mediaName } = dto;
    
        // Vérifier si l'utilisateur existe déjà
        const user = await this.prisma.userMusicPlatform.findUnique({
            where: { user_id: userId },
        });
    
        if (!user && !mediaName) {
            // Si l'utilisateur n'existe pas et que mediaName est manquant, lever une exception
            throw new BadRequestException("mediaName is required when creating a new user media");
        }
    
        const userMedia = await this.prisma.userMusicPlatform.upsert({
            where: { user_id: userId },
            update: {
                token_account: tokenAccount,
                ...(mediaName && { music_media_id: mediaName as MusicPlatform }), // Inclure mediaName uniquement s'il est fourni
            },
            create: {
                user_id: userId,
                token_account: tokenAccount,
                music_media_id: mediaName as MusicPlatform, // mediaName est obligatoire lors de la création
            },
        });
    
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
        //publier les informations de la playlist sur le topic
        await this.kafkaService.produce('user-shared-playlist', {
            userId: userId,
            playlistId: playlistId,
            action: 'share',
            timeStamp: new Date().toISOString(),
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

    async postUserSharedMusic(userId: number, musicId: string){
        const musicAlreadySHared = await this.prisma.userSharedMusic.findFirst({
            where: {
                user_id: userId,
                music_id: musicId
            },
        });

        if(musicAlreadySHared){
            throw new Error('Music already shared');
        }

        console.log("Music shared ...");
        const musicToAdd = await this.prisma.userSharedMusic.create({  
            data: {
                music_id: musicId,
                user_id: userId,
            },
        });

        //publier les informations de la musique sur le topic
        await this.kafkaService.produce('user-shared-music', {
            userId: userId,
            musicId: musicId,
            action: 'share',
            timeStamp: new Date().toISOString(),
        });

        return musicToAdd;
    }

    async getUserSharedMusic(userId: number, musicId: string){
        const sharedMusic = await this.prisma.userSharedMusic.findUnique({
            where: {user_id: userId,
                    music_id: musicId},
        });
        if(!sharedMusic){
            return {error: "Music not found"};
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
                apiUrl = `https://api.spotify.com/v1/tracks/${sharedMusic.music_id}`;
                headers = {
                    Authorization: `Bearer ${userToken}`,
                };
                break;
            case MusicPlatform.APPLE_MUSIC:
                apiUrl = `https://api.music.apple.com/v1/catalog/us/songs/${sharedMusic.music_id}`;
                headers = {
                    Authorization: `Bearer ${userToken}`,
                };
                break;
            default:
                throw new Error("Media not supported");
        }
        const response = await firstValueFrom(
            this.httpService.get(apiUrl,{headers}),
        );
        return response.data;
    }


    async getUserSharedPlaylists(userId: number) {
        // On récupère toutes les playlists partagées depuis la base de données
        const sharedPlaylists = await this.prisma.userSharedPlaylist.findMany({
            where: { user_id: userId },
        });
    
        if (!sharedPlaylists || sharedPlaylists.length === 0) {
            return { error: "No playlists found" };
        }
    
        // On Récupère la plateforme et le token de l'utilisateur
        const userMedia = await this.getUserMedia(userId);
        const userToken = await this.getUserMediaToken(userId);
    
        // Pour chaque playlist, appelle l'API Spotify/Apple Music
        const playlistsDetails = await Promise.all(
            sharedPlaylists.map(async (playlist) => {
                let apiUrl: string;
                const headers = { Authorization: `Bearer ${userToken}` };
    
                switch (userMedia) {
                    case MusicPlatform.SPOTIFY:
                        apiUrl = `https://api.spotify.com/v1/playlists/${playlist.playlist_id}`;
                        break;
                    case MusicPlatform.APPLE_MUSIC:
                        apiUrl = `https://api.music.apple.com/v1/catalog/us/playlists/${playlist.playlist_id}`;
                        break;
                    default:
                        throw new Error("Media not supported");
                }
    
                const response = await firstValueFrom(
                    this.httpService.get(apiUrl, { headers }),
                );
                return response.data; // Détails de la playlist
            })
        );
    
        return playlistsDetails; // Renvoie un tableau de toutes les playlists
    }
   

    
    async getUserSharedMusics(userId: number){
        //On recupere les musics partagées par l'utilisateur
        const sharedMusics = await this.prisma.userSharedMusic.findMany({
            where: {user_id: userId},
        });

        if(!sharedMusics){
            return error('No musics found for this user');
        }
        //On recupere la plateforme aisni que le token du user 
        const userMedia = await this.getUserMedia(userId);
        const userToken = await this.getUserMediaToken(userId);

        //Pour chaque music, on appelle l'API Spotify/Apple Music
        const musicsDetails = await Promise.all(
            sharedMusics.map(async(music) => {
                let apiUrl: string;
                const headers = { Authorization: `Bearer ${userToken}` };
                switch(userMedia){
                    case MusicPlatform.SPOTIFY:
                        apiUrl = `https://api.spotify.com/v1/tracks/${music.music_id}`;
                        break;

                    case MusicPlatform.APPLE_MUSIC:
                        apiUrl = `https://api.music.apple.com/v1/catalog/us/songs/${music.music_id}`;
                        break;
                    default:
                        throw new Error("Media not supported");        
                }
                const response = await firstValueFrom(
                    this.httpService.get(apiUrl, { headers }),
                );
                return response.data;

            })
        );
        return musicsDetails; // Renvoie un tableau de toutes les musiques
    }
}