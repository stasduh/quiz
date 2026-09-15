import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard } from './admin-auth.guard';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/login.dto';
import { UpsertQuestionDto } from './dto/upsert-question.dto';
import { UpsertRoundDto } from './dto/upsert-round.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  login(@Body() dto: AdminLoginDto) {
    return this.adminService.login(dto.email, dto.password);
  }

  @UseGuards(AdminAuthGuard)
  @Get('rounds')
  listRounds() {
    return this.adminService.listRounds();
  }

  @UseGuards(AdminAuthGuard)
  @Post('rounds')
  createRound(@Body() dto: UpsertRoundDto) {
    return this.adminService.createRound(dto);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('rounds/:id/publish')
  setPublished(@Param('id') id: string, @Body('is_published') isPublished: boolean) {
    return this.adminService.setRoundPublished(id, !!isPublished);
  }

  @UseGuards(AdminAuthGuard)
  @Delete('rounds/:id')
  deleteRound(@Param('id') id: string) {
    return this.adminService.deleteRound(id);
  }

  @UseGuards(AdminAuthGuard)
  @Get('rounds/:id/questions')
  listQuestions(@Param('id') id: string) {
    return this.adminService.listQuestions(id);
  }

  @UseGuards(AdminAuthGuard)
  @Post('rounds/:id/questions')
  createQuestion(@Param('id') id: string, @Body() dto: UpsertQuestionDto) {
    return this.adminService.createQuestion(id, dto);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('questions/:id')
  updateQuestion(@Param('id') id: string, @Body() dto: UpsertQuestionDto) {
    return this.adminService.updateQuestion(id, dto);
  }

  @UseGuards(AdminAuthGuard)
  @Delete('questions/:id')
  deleteQuestion(@Param('id') id: string) {
    return this.adminService.deleteQuestion(id);
  }

  @UseGuards(AdminAuthGuard)
  @Get('leaderboard')
  async leaderboard(@Query('limit') limit?: string) {
    const parsedLimit = Math.min(Math.max(parseInt(limit ?? '50', 10) || 50, 1), 200);
    const players = await this.adminService.listTopPlayers(parsedLimit);
    return players.map((p) => ({
      id: p.id,
      nickname: p.nickname,
      avatar_key: p.avatarKey,
      current_round: p.currentRound,
      total_score: Number(p.totalScore),
    }));
  }
}
