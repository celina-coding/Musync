import { Controller, Get, Query } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Get('callback')
  handleSpotifyCallback(@Query('code') code: string) {
    if (!code) {
      return { error: 'Authorization code is missing' };
    }

    // Log the authorization code (for debugging)
    console.log('Authorization Code:', code);

    // You can now use the code to request an access token from Spotify
    return { message: 'Authorization code received', code };
  }
}



