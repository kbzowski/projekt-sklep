import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { ProductFilterDto } from './dto/product-filter.dto';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll(@Query() filter: ProductFilterDto) {
    return this.productService.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productService.findOne(id);
  }
}
