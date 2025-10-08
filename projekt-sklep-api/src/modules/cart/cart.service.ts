import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: number) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return cartItems.map(item => ({
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        category: item.product.category.slug,
        categoryId: item.product.categoryId,
        image: item.product.image,
        description: item.product.description,
      },
      quantity: item.quantity,
    }));
  }

  async addToCart(userId: number, data: AddToCartDto) {
    const { productId, quantity } = data;

    // Sprawdź czy produkt istnieje
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Sprawdź czy item już jest w koszyku
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingItem) {
      // Zwiększ ilość
      return this.prisma.cartItem.update({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      });
    }
    else {
      // Dodaj nowy item
      return this.prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity,
        },
      });
    }
  }

  async updateCartItem(userId: number, productId: number, data: UpdateCartDto) {
    const { quantity } = data;

    if (quantity <= 0) {
      return this.removeFromCart(userId, productId);
    }

    return this.prisma.cartItem.update({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      data: {
        quantity,
      },
    });
  }

  async removeFromCart(userId: number, productId: number) {
    return this.prisma.cartItem.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }

  async clearCart(userId: number) {
    return this.prisma.cartItem.deleteMany({
      where: { userId },
    });
  }
}
