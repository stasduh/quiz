import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GuestLoginDto } from './dto/guest-login.dto';
import { LinkGoogleDto } from './dto/link-google.dto';
import { AuthenticatedRequest, JwtAuthGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('guest')
  guestLogin(@Body() dto: GuestLoginDto) {
    return this.authService.guestLogin(dto.device_id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('link-google')
  linkGoogle(@Req() req: AuthenticatedRequest, @Body() dto: LinkGoogleDto) {
    return this.authService.linkGoogle(req.userId as string, dto.id_token);
  }
}
