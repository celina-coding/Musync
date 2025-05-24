import { Body, Controller, Get, HttpStatus, Param, Patch, Post, Query, Res, UseGuards } from "@nestjs/common";
import { MusicService } from "./music.service";
import { Response } from 'express';
import { request } from "http";
import { SetMediaDto } from "./dto";

@Controller('music')
export class MusicController{
    constructor(private musicService: MusicService){}

    @Post('setMedia')
    setUserMedia(
        @Body() dto: SetMediaDto,
    ){
        return this.musicService.setUserMedia(dto);
    }
    
    @Get('getMedia/:userId')
    async getUserMedia(
        @Param('userId') userId: number,
    ){
        const userIdNumber = Number(userId);
        const userMedia = await this.musicService.getUserMedia(userIdNumber);
        return {userMedia};

    }
   
    @Get('getMediaToken/:userId')
    async getUserMediaToken(
        @Param('userId') userId: number,
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
    
   
    @Post('sharedMusic')
    postUserSharedMusic(
        @Body('userId') userId: number,
        @Body('musicId') musicId: string,
        
    ){
        return this.musicService.postUserSharedMusic(userId, musicId);
    }

    @Get('getSharedMusic')
    async getUserSharedMusic(
        @Query('userId') userId: string,
        @Query('MusicId') musicId: string,
        
        @Res() res: Response
    ){
        try {
            // Convertir userId en un nombre
            const userIdNumber = parseInt(userId, 10);

            // Appeler la méthode du service
            const musiDetails = await this.musicService.getUserSharedMusic(userIdNumber, musicId);

            // Retourner la réponse au client
            return res.status(HttpStatus.OK).json(musiDetails);
        } catch (error) {
            // Gérer les erreurs
            console.error("Error in getUserSharedMusic:", error.message);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                error: "Failed to retrieve music details",
                details: error.message,
            });
        }
    }
 
    @Get('getSharedPlaylists')
    async getUserSharedPlaylists(
        @Query('userId') userId: string,
      
        @Res() res: Response
    ){
        try {
            // Convertir userId en un nombre
            const userIdNumber = parseInt(userId, 10);

            // Appeler la méthode du service
            const playlistsDetails = await this.musicService.getUserSharedPlaylists(userIdNumber);

            // Retourner la réponse au client
            return res.status(HttpStatus.OK).json(playlistsDetails);
        } catch (error) {
            // Gérer les erreurs
            console.error("Error in getUserSharedPlaylists:", error.message);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                error: "Failed to retrieve playlists details",
                details: error.message,
            });
        }
    }

   
    @Get('getSharedMusics')
    async getUserSharedMusics(
        @Query('userId') userId: string,
       
        @Res() res: Response
    ){
        try{
            const userIdNumber = parseInt(userId, 10);
            const musicsDetails = await this.musicService.getUserSharedMusics(userIdNumber);
            return res.status(HttpStatus.OK).json(musicsDetails);
        }catch(error){
            console.error("Error in getUserSharedMusics:", error.message);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                error: "Failed to retrieve musics details",     
                details: error.message,
            });
        }
    } 

}   