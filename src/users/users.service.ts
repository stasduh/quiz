import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { serializeUser } from '../common/serialize-user';
import { containsProfanity } from './profanity';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async updateProfile(userId: string, nickname?: string, avatarKey?: string) {
    if (!nickname && !avatarKey) {
      throw new BadRequestException('Передайте nickname и/или avatar_key');
    }
    if (nickname && containsProfanity(nickname)) {
      throw new BadRequestException('Никнейм содержит недопустимые слова');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(nickname ? { nickname } : {}),
        ...(avatarKey ? { avatarKey } : {}),
      },
    });

    return serializeUser(updated);
  }
}
