import { IsString, IsNotEmpty } from 'class-validator';

export class LinkGoogleDto {
  @IsString()
  @IsNotEmpty()
  id_token!: string;
}
