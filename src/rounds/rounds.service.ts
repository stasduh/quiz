import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { POINTS_PER_CORRECT_ANSWER } from '../common/constants';
import { CompleteRoundDto } from './dto/complete-round.dto';

@Injectable()
export class RoundsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentRound(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const round = await this.prisma.round.findFirst({
      where: { roundNumber: user.currentRound, isPublished: true },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: { options: { orderBy: { orderIndex: 'asc' } } },
        },
      },
    });

    if (!round) {
      return { status: 'no_more_rounds' as const };
    }

    return {
      round_number: round.roundNumber,
      round_id: round.id,
      questions: round.questions.map((q) => ({
        id: q.id,
        text_question: q.textQuestion,
        media_url: q.mediaUrl,
        options: q.options.map((o) => ({
          id: o.id,
          text: o.text,
          is_correct: o.isCorrect,
        })),
      })),
    };
  }

  async completeRound(userId: string, dto: CompleteRoundDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (dto.round_number !== user.currentRound) {
      throw new BadRequestException(
        `Раунд рассинхронизирован: ожидался ${user.currentRound}, получен ${dto.round_number}`,
      );
    }

    const round = await this.prisma.round.findUnique({ where: { id: dto.round_id } });
    if (!round || round.roundNumber !== dto.round_number) {
      throw new BadRequestException('Раунд не найден или не совпадает с номером');
    }

    const scoreEarned = dto.correct_count * POINTS_PER_CORRECT_ANSWER;

    const [, updatedUser] = await this.prisma.$transaction([
      this.prisma.roundAttempt.create({
        data: {
          userId,
          roundId: round.id,
          correctCount: dto.correct_count,
          totalQuestions: dto.total_questions,
          scoreEarned,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          totalScore: { increment: scoreEarned },
          // Раунд засчитывается как пройденный при любом завершении.
          currentRound: { increment: 1 },
        },
      }),
    ]);

    return {
      score_earned: scoreEarned,
      total_score: Number(updatedUser.totalScore),
      current_round: updatedUser.currentRound,
    };
  }
}
