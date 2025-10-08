import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import { TokenGuard } from '../auth/token.guard';
import { UserID } from '../auth/user.decorator';

import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Controller('cart')
@UseGuards(TokenGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@UserID() userId: number) {
    return this.cartService.getCart(userId);
  }

  @Post()
  addToCart(@UserID() userId: number, @Body() data: AddToCartDto) {
    return this.cartService.addToCart(userId, data);
  }

  @Put(':productId')
  updateCartItem(
    @UserID() userId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() data: UpdateCartDto,
  ) {
    return this.cartService.updateCartItem(userId, productId, data);
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeFromCart(
    @UserID() userId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.cartService.removeFromCart(userId, productId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  clearCart(@UserID() userId: number) {
    return this.cartService.clearCart(userId);
  }
}
