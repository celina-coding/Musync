import { HttpService } from "@nestjs/axios";
import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { KafkaService } from "src/kafka/kafka.service";
import { firstValueFrom } from "rxjs";
import { MusicPlatform } from "@prisma/client";
import { SpotifyTokenResponse } from "./interfaces/spotify-token-response.interface";

@Injectable()
export class AuthService {

    private readonly spotifyClientId = process.env.SPOTIFY_CLIENT_ID;
    private readonly spotifyClientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    private readonly redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3333/auth/callback';
    private readonly spotifyAuthUrl = 'https://accounts.spotify.com/authorize';
    private readonly spotifyTokenUrl = 'https://accounts.spotify.com/api/token';


    constructor(
        private httpService: HttpService,
        private prisma: PrismaService,
        private kafkaService: KafkaService
    ) { 

        if (!this.spotifyClientId || !this.spotifyClientSecret) {
            throw new Error('Spotify client credentials are missing in environment variables');
        }

    }

    async generateSpotifyAuthUrl(userId: number): Promise<string> {
        const scopes = [
            'user-read-private',
            'user-read-email',
            'playlist-read-private',
            'playlist-read-collaborative',
            'user-library-read',
            'user-top-read',
            'user-read-recently-played'
        ].join(' ');

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.spotifyClientId || '',
            scope: scopes,
            redirect_uri: this.redirectUri,
            state: userId.toString(), // Utiliser l'userId comme state pour le retrouver dans le callback
            show_dialog: 'true' // Forcer l'affichage de la boîte de dialogue de connexion
        });

        return `${this.spotifyAuthUrl}?${params.toString()}`;
    }

    async exchangeCodeForToken(code: string): Promise<SpotifyTokenResponse> {
        const data = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: this.redirectUri,
            client_id: this.spotifyClientId || '',
            client_secret: this.spotifyClientSecret || ''
        });

        try {
            const response = await firstValueFrom(
                this.httpService.post(this.spotifyTokenUrl, data.toString(), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
            );

            return response.data as SpotifyTokenResponse;
        } catch (error) {
            console.error('Error exchanging code for token:', error.response?.data || error.message);
            throw new BadRequestException('Failed to exchange authorization code for token');
        }
    }

    async saveUserToken(userId: number, accessToken: string): Promise<void> {
        try {
            await this.prisma.userMusicPlatform.upsert({
                where: { user_id: userId },
                update: {
                    token_account: accessToken,
                    music_media_id: MusicPlatform.SPOTIFY
                },
                create: {
                    user_id: userId,
                    token_account: accessToken,
                    music_media_id: MusicPlatform.SPOTIFY
                }
            });

            console.log(`Token saved successfully for user ${userId}`);
        } catch (error) {
            console.error('Error saving user token:', error);
            throw new Error('Failed to save user token');
        }
    }

    async publishUserConnection(userId: number, accessToken: string): Promise<void> {
        try {
            await this.kafkaService.produce('user-music-platform', {
                userId: userId,
                tokenAccount: accessToken,
                mediaName: MusicPlatform.SPOTIFY,
                action: 'connect',
                timestamp: new Date().toISOString()
            });

            console.log(`User connection published to Kafka for user ${userId}`);
        } catch (error) {
            console.error('Error publishing user connection:', error);
            // Ne pas faire échouer l'authentification si Kafka échoue
        }
    }



     async isUserConnected(userId: number): Promise<boolean> {
        try {
            const userMedia = await this.prisma.userMusicPlatform.findUnique({
                where: { user_id: userId }
            });

            return !!(userMedia && userMedia.token_account);
        } catch (error) {
            console.error('Error checking user connection:', error);
            return false;
        }
    }

    // Rafraîchir le token (si tu implémentes le refresh token)
    async refreshUserToken(userId: number): Promise<string> {
        // Cette méthode nécessiterait de stocker le refresh_token
        // Pour l'instant, on peut simplement lever une erreur
        throw new Error('Token refresh not implemented yet. Please re-authenticate.');
    }

    // Valider un token Spotify
    async validateSpotifyToken(token: string): Promise<boolean> {
        try {
            const response = await firstValueFrom(
                this.httpService.get('https://api.spotify.com/v1/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
            );

            return response.status === 200;
        } catch (error) {
            console.error('Token validation failed:', error.response?.status);
            return false;
        }
    }

    // Révoquer l'accès d'un utilisateur
    async revokeUserAccess(userId: number): Promise<void> {
        try {
            await this.prisma.userMusicPlatform.delete({
                where: { user_id: userId }
            });

            console.log(`Access revoked for user ${userId}`);
        } catch (error) {
            console.error('Error revoking user access:', error);
            throw new Error('Failed to revoke user access');
        }
    }

}