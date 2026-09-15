import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_AVATAR_KEY } from '../common/constants';
import { serializeUser } from '../common/serialize-user';

@Injectable()
export class AuthService {
  private readonly googleClient = new OAuth2Client();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private generateNickname(): string {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `Игрок${suffix}`;
  }

  async guestLogin(deviceId: string) {
    let user = await this.prisma.user.findUnique({ where: { deviceId } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          deviceId,
          nickname: this.generateNickname(),
          avatarKey: DEFAULT_AVATAR_KEY,
        },
      });
    }
    const token = this.jwtService.sign({ sub: user.id });
    return { token, user: serializeUser(user) };
  }

  async linkGoogle(userId: string, idToken: string) {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const ticket = await this.googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub) {
      throw new ConflictException('Invalid Google token');
    }
    const googleId = payload.sub;

    const existing = await this.prisma.user.findUnique({ where: { googleId } });
    if (existing && existing.id !== userId) {
      throw new ConflictException('Этот Google-аккаунт уже привязан к другому пользователю');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { googleId },
    });
    return serializeUser(user);
  }
}
