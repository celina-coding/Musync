import { Body, Controller, Get, HttpStatus, Param, Patch, Post, Query, Res } from "@nestjs/common";
import { MusicService } from "./music.service";
import { Response } from 'express';
import { request } from "http";

@Controller('music')
export class MusicController{
    constructor(private musicService: MusicService){}

    @Post('setMedia')
    setUserMedia(
        @Body('userId') userId: number,       
        @Body('tokenAccount') tokenAccount: string, 
        @Body('mediaName') mediaName: string
    ){
        return this.musicService.setUserMedia(userId, tokenAccount, mediaName);
    }

    @Get('getMedia/:userId')
    async getUserMedia(
        @Param('userId') userId: number
    ){
        const userIdNumber = Number(userId);
        const userMedia = await this.musicService.getUserMedia(userIdNumber);
        return {userMedia};

    }

    @Get('getMediaToken/:userId')
    async getUserMediaToken(
        @Param('userId') userId: number
    ){
        const userIdNumber = Number(userId);
        const userMediaToken = await this.musicService.getUserMediaToken(userIdNumber);
        return {userMediaToken};
    }

    // http://localhost:3333/music/sendRequestToAPI?url=https://api.spotify.com/v1/me/playlists&userId=1
    @Get('sendRequestToAPI')
    sendRequestToAPI(
        @Query('url') url: string, 
        @Query('userId') userId: string,
    ) {
        const userIdNumber = parseInt(userId, 10); // Convert userId to a number
        if (isNaN(userIdNumber)) {
            throw new Error("Invalid userId: must be a number");
        }
    
        const request = { url }; // Create a request object
        return this.musicService.sendRequestToAPI(request, userIdNumber);
    }

    //http://localhost:3333/music/sendRequestToSpotify?url=https://api.spotify.com/v1/me/playlists&userId=1
   @Get('sendRequestToSpotify')
    sendRequestToSpotify(
        @Query('url') url: string, 
        @Query('userId') userId: string,
    ){
        const userIdNumber = parseInt(userId, 10); // Convertir le userId en un nombre
        if (isNaN(userIdNumber)) {
            throw new Error("Invalid userId: must be a number");
        }
        const request = { url }; 
        return this.musicService.sendRequestToSpotify(request, userIdNumber);
    }

    @Get('sendRequestToAppleMusic')
    sendRequestToAppleMusic(
        @Query('url') url: string, 
        @Query('userId') userId: string,
    ){
        const userIdNumber = parseInt(userId, 10); // Convertir le userId en un nombre
        if (isNaN(userIdNumber)) {
            throw new Error("Invalid userId: must be a number");
        }
        const request = { url }; 
        return this.musicService.sendRequestToAppleMusic(request, userIdNumber);
    }

    @Post('sharedPlaylist')
    postUserSharedPlaylist(
        @Body('userId') userId: number,
        @Body('playlistId') playlistId: string,
    )
    {
        return this.musicService.postUserSharedPlaylist(userId,playlistId);
 
    }


    @Get('getSharedPlaylist')
    async getUserSharedPlaylist(
        @Query('userId') userId: string,
        @Query('playlistId') playlistId: string,
        @Res() res: Response
    ){

        try {
            // Convertir userId en un nombre
            const userIdNumber = parseInt(userId, 10);

            // Appeler la méthode du service
            const playlistDetails = await this.musicService.getUserSharedPlaylist(userIdNumber, playlistId);

            // Retourner la réponse au client
            return res.status(HttpStatus.OK).json(playlistDetails);
        } catch (error) {
            // Gérer les erreurs
            console.error("Error in getUserSharedPlaylist:", error.message);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                error: "Failed to retrieve playlist details",
                details: error.message,
            });
        }
           
            
        

        
    }
    


    @Get('getSharedPlaylists')
    getUserSharedPlaylists(){}
   

    @Get('getSharedMusic')
    getUserSharedMusic(){}

    @Post('postSharedMusic')
    postUserSharedMusic(){}

   
}   