import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { AgeGroup, Gender, Order, SortBy } from './app.type';
import { Type } from 'class-transformer';

export class PostRequestDTO {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name cannot be empty' })
  name!: string;
}

// export class GenderDTO {
//   @IsOptional()
//   @IsEnum(Gender)
//   gender?: Gender;
// }

export class FetchProfilesDto {
  @IsOptional()
  @IsEnum(Gender, {
    message: 'gender Query Parameter if included must be "male" or "female"',
  })
  gender?: Gender;

  @IsOptional()
  @IsEnum(AgeGroup, {
    message:
      'age_group query parameter if included must be "child" or "teenager" or "adult" or "senior"',
  })
  age_group?: AgeGroup;

  @IsOptional()
  @IsString()
  country_id?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  min_age?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  max_age?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  min_gender_probability?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  min_country_probability?: number;

  @IsOptional()
  @IsEnum(SortBy, {
    message:
      'sort_by query parameter if included must be "age" or "created_at" or "gender_probability" ',
  })
  sort_by?: SortBy;

  @IsOptional()
  @IsEnum(Order, {
    message:
      'order query parameter if included must be "asc" to indicate ascending or "desc" to indicate descending',
  })
  order?: Order;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}

export class NaturalLanguageSearchQueryDto {
  @IsString({ message: 'q must be a string' })
  @IsNotEmpty({ message: 'q cannot be empty' })
  q!: string;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;
}
