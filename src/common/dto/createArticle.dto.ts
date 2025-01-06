import {
  IsString,
  IsArray,
  IsEnum,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ArticleStatus } from '../enum/articleStatus.enum';

class SectionDto {
  @IsString()
  subHeading: string;

  @IsString()
  content: string;
}

export class CreateArticleDto {
  @IsString()
  mainHeading: string;

  @IsString()
  intro: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SectionDto)
  sections: SectionDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;
}
