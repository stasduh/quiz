import { IsInt, IsString, IsUUID, Min } from 'class-validator';

export class CompleteRoundDto {
  @IsUUID()
  round_id!: string;

  @IsInt()
  @Min(1)
  round_number!: number;

  @IsInt()
  @Min(0)
  correct_count!: number;

  @IsInt()
  @Min(1)
  total_questions!: number;
}
