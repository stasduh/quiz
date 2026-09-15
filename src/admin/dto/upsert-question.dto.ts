import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class OptionDto {
  @IsString()
  @MinLength(1)
  text!: string;

  @IsBoolean()
  is_correct!: boolean;
}

export class UpsertQuestionDto {
  @IsInt()
  @Min(1)
  order_index!: number;

  @IsString()
  @MinLength(1)
  text_question!: string;

  @IsOptional()
  @IsUrl()
  media_url?: string;

  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  @ArrayMinSize(2)
  options!: OptionDto[];
}
