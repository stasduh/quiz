import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/jwt.guard';
import { CompleteRoundDto } from './dto/complete-round.dto';
import { RoundsService } from './rounds.service';

@UseGuards(JwtAuthGuard)
@Controller('round')
export class RoundsController {
  constructor(private readonly roundsService: RoundsService) {}

  @Get('current')
  getCurrent(@Req() req: AuthenticatedRequest) {
    return this.roundsService.getCurrentRound(req.userId as string);
  }

  @Post('complete')
  complete(@Req() req: AuthenticatedRequest, @Body() dto: CompleteRoundDto) {
    return this.roundsService.completeRound(req.userId as string, dto);
  }
}
