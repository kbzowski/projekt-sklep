import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class ProductFilterDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsIn(['name', 'price-asc', 'price-desc'])
  sortBy?: 'name' | 'price-asc' | 'price-desc' = 'name';

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 6;
}
