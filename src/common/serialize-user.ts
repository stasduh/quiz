import { User } from '@prisma/client';

// Prisma отдаёт BigInt для total_score — JSON.stringify падает на BigInt,
// поэтому у публичного DTO поле явно приводится к number/string.
export function serializeUser(user: User) {
  return {
    id: user.id,
    nickname: user.nickname,
    avatar_key: user.avatarKey,
    current_round: user.currentRound,
    total_score: Number(user.totalScore),
  };
}
