import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpsertRoundDto {
  @IsInt()
  @Min(1)
  round_number!: number;

  @IsOptional()
  @IsBoolean()
  is_published?: boolean;
}
