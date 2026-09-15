import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class GuestLoginDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  device_id!: string;
}
