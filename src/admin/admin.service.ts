import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertQuestionDto } from './dto/upsert-question.dto';
import { UpsertRoundDto } from './dto/upsert-round.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      throw new UnauthorizedException('Неверный email или пароль');
    }
    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }
    const token = this.jwtService.sign({ sub: admin.id, role: 'admin' }, { expiresIn: '7d' });
    return { token, admin: { id: admin.id, email: admin.email } };
  }

  // --- Раунды ---

  listRounds() {
    return this.prisma.round.findMany({
      orderBy: { roundNumber: 'asc' },
      include: { _count: { select: { questions: true } } },
    });
  }

  async createRound(dto: UpsertRoundDto) {
    const existing = await this.prisma.round.findUnique({
      where: { roundNumber: dto.round_number },
    });
    if (existing) {
      throw new ConflictException(`Раунд ${dto.round_number} уже существует`);
    }
    return this.prisma.round.create({
      data: { roundNumber: dto.round_number, isPublished: dto.is_published ?? false },
    });
  }

  async setRoundPublished(roundId: string, isPublished: boolean) {
    await this.ensureRoundExists(roundId);
    return this.prisma.round.update({ where: { id: roundId }, data: { isPublished } });
  }

  async deleteRound(roundId: string) {
    await this.ensureRoundExists(roundId);
    await this.prisma.round.delete({ where: { id: roundId } });
    return { deleted: true };
  }

  private async ensureRoundExists(roundId: string) {
    const round = await this.prisma.round.findUnique({ where: { id: roundId } });
    if (!round) {
      throw new NotFoundException('Раунд не найден');
    }
    return round;
  }

  // --- Вопросы ---

  async listQuestions(roundId: string) {
    await this.ensureRoundExists(roundId);
    return this.prisma.question.findMany({
      where: { roundId },
      orderBy: { orderIndex: 'asc' },
      include: { options: { orderBy: { orderIndex: 'asc' } } },
    });
  }

  async createQuestion(roundId: string, dto: UpsertQuestionDto) {
    await this.ensureRoundExists(roundId);
    this.validateOptions(dto);

    return this.prisma.question.create({
      data: {
        roundId,
        orderIndex: dto.order_index,
        textQuestion: dto.text_question,
        mediaUrl: dto.media_url,
        options: {
          create: dto.options.map((o, index) => ({
            orderIndex: index + 1,
            text: o.text,
            isCorrect: o.is_correct,
          })),
        },
      },
      include: { options: true },
    });
  }

  async updateQuestion(questionId: string, dto: UpsertQuestionDto) {
    const question = await this.prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      throw new NotFoundException('Вопрос не найден');
    }
    this.validateOptions(dto);

    return this.prisma.$transaction(async (tx) => {
      await tx.questionOption.deleteMany({ where: { questionId } });
      return tx.question.update({
        where: { id: questionId },
        data: {
          orderIndex: dto.order_index,
          textQuestion: dto.text_question,
          mediaUrl: dto.media_url,
          options: {
            create: dto.options.map((o, index) => ({
              orderIndex: index + 1,
              text: o.text,
              isCorrect: o.is_correct,
            })),
          },
        },
        include: { options: true },
      });
    });
  }

  async deleteQuestion(questionId: string) {
    const question = await this.prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      throw new NotFoundException('Вопрос не найден');
    }
    await this.prisma.question.delete({ where: { id: questionId } });
    return { deleted: true };
  }

  private validateOptions(dto: UpsertQuestionDto) {
    if (dto.options.length < 2) {
      throw new BadRequestException('Нужно минимум 2 варианта ответа');
    }
    const correctCount = dto.options.filter((o) => o.is_correct).length;
    if (correctCount !== 1) {
      throw new BadRequestException('Должен быть ровно один правильный вариант ответа');
    }
  }

  // --- Лидерборд (read-only просмотр) ---

  listTopPlayers(limit: number) {
    return this.prisma.user.findMany({
      orderBy: { totalScore: 'desc' },
      take: limit,
    });
  }
}
