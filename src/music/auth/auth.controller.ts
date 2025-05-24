import { Controller, Get, Query, Res, HttpStatus, Post, Body, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.serice';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard, Roles } from 'nest-keycloak-connect';


@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    // authentifiaction avec Spotify
    @Get('spotify/login')
    async initiateSpotifyAuth(@Query('userId') userId: string, @Res() res: Response) {
        try {
            const userIdNumber = parseInt(userId, 10);
            if (isNaN(userIdNumber)) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    error: 'Invalid userId: must be a number'
                });
            }

            const authUrl = await this.authService.generateSpotifyAuthUrl(userIdNumber);
            
            // redirection vers spotify pour l'authentification
            return res.redirect(authUrl);
        } catch (error) {
            console.error('Error initiating Spotify auth:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                error: 'Failed to initiate Spotify authentication'
            });
        }
    }

  
    @Get('callback')
    async handleSpotifyCallback(
        @Query('code') code: string,
        @Query('state') state: string,
        @Query('error') error: string,
        @Res() res: Response
    ) {
        try {
            // Vérifier s'il y a une erreur de Spotify
            if (error) {
                console.error('Spotify authentication error:', error);
                return res.status(HttpStatus.BAD_REQUEST).json({
                    error: 'Spotify authentication failed',
                    details: error
                });
            }

            // Vérifier si le code d'autorisation est présent
            if (!code) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    error: 'Authorization code is missing'
                });
            }

            // Vérifier et décoder le state pour récupérer l'userId
            if (!state) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    error: 'State parameter is missing'
                });
            }

            const userId = parseInt(state, 10);
            if (isNaN(userId)) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    error: 'Invalid state parameter'
                });
            }

            // Échanger le code contre un access token
            const tokenData = await this.authService.exchangeCodeForToken(code);
            
            // Sauvegarder le token pour l'utilisateur
            await this.authService.saveUserToken(userId, tokenData.access_token);

            // Publier sur Kafka que l'utilisateur s'est connecté
            await this.authService.publishUserConnection(userId, tokenData.access_token);

            // Rediriger vers une page de succès ou retourner une réponse JSON
            return res.status(HttpStatus.OK).json({
                message: 'Spotify authentication successful',
                userId: userId,
                // Ne pas exposer le token complet pour des raisons de sécurité
                tokenPreview: tokenData.access_token.substring(0, 10) + '...'
            });

        } catch (error) {
            console.error('Error in Spotify callback:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                error: 'Failed to process Spotify authentication',
                details: error.message
            });
        }
    }

    // Endpoint pour rafraîchir le token (si tu implémentes le refresh token)
    @Post('refresh-token')
    async refreshSpotifyToken(@Body('userId') userId: number) {
        try {
            const newToken = await this.authService.refreshUserToken(userId);
            return {
                message: 'Token refreshed successfully',
                tokenPreview: newToken.substring(0, 10) + '...'
            };
        } catch (error) {
            console.error('Error refreshing token:', error);
            return {
                error: 'Failed to refresh token',
                details: error.message
            };
        }
    }

    // Endpoint pour vérifier le statut de connexion d'un utilisateur
    @Get('status/:userId')
    async getAuthStatus(@Query('userId') userId: string) {
        try {
            const userIdNumber = parseInt(userId, 10);
            if (isNaN(userIdNumber)) {
                return { error: 'Invalid userId: must be a number' };
            }

            const isConnected = await this.authService.isUserConnected(userIdNumber);
            return {
                userId: userIdNumber,
                isConnected: isConnected,
                platform: isConnected ? 'SPOTIFY' : null
            };
        } catch (error) {
            console.error('Error checking auth status:', error);
            return {
                error: 'Failed to check authentication status',
                details: error.message
            };
        }
    }
}