import { Body, Controller, Get, Patch, Post } from "@nestjs/common";
import { MusicService } from "./music.service";

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


    @Get('getSharedPlaylists')
    getUserSharedPlaylists(){}

    @Get('getSharedPlaylist')
    getUserSharedPlaylist(){}

    @Get('getSharedMusic')
    getUserSharedMusic(){}

    @Get('getMedia')
    getUserMedia(){}

    @Get('getMediaToken')
    getUserMediaToken(){}

    @Post('postSharedPlaylist')
    postUserSharedPlaylist(){}

    @Post('postSharedMusic')
    postUserSharedMusic(){}

    @Post('sendRequestToAPI')
    sendRequestToAPI(){}

    @Post('sendRequestToSpotify')
    sendRequestToSpotify(){}

    @Post('sendRequestToAppleMusic')
    sendRequestToAppleMusic(){}

}   