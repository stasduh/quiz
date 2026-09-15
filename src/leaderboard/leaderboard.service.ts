import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaderboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getLeaderboard(userId: string, limit: number) {
    const top = await this.prisma.user.findMany({
      orderBy: { totalScore: 'desc' },
      take: limit,
    });

    const entries = top.map((u, index) => ({
      rank: index + 1,
      nickname: u.nickname,
      avatar_key: u.avatarKey,
      current_round: u.currentRound,
      total_score: Number(u.totalScore),
    }));

    // Позиция текущего игрока (может быть за пределами top limit).
    const me = await this.prisma.user.findUnique({ where: { id: userId } });
    const higherCount = me
      ? await this.prisma.user.count({ where: { totalScore: { gt: me.totalScore } } })
      : 0;

    return {
      entries,
      me: me
        ? {
            rank: higherCount + 1,
            nickname: me.nickname,
            current_round: me.currentRound,
            total_score: Number(me.totalScore),
          }
        : null,
    };
  }
}
