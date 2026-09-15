import { IsIn, IsOptional, IsString, Length } from 'class-validator';
import { AVATAR_PRESETS } from '../../common/constants';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(2, 16)
  nickname?: string;

  @IsOptional()
  @IsString()
  @IsIn(AVATAR_PRESETS as unknown as string[])
  avatar_key?: string;
}
