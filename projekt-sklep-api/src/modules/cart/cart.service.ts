import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
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

    return this.prisma.cartItem.upsert({
      where: {
        // 1. Warunek Wyszukiwania: Używamy unikalnego pola złożonego
        userId_productId: {
          userId,
          productId,
        },
      },
      update: {
        // 2. Jeśli rekord ZNALEZIONO: Zwiększamy ilość o podaną `quantity`.
        // Użycie increment jest kluczowe w tym miejscu, ponieważ działa atomowo w bazie danych.
        // https://www.prisma.io/docs/orm/prisma-client/queries/crud#update-a-number-field
        quantity: {
          increment: quantity,
        },
      },
      create: {
        // 3. Jeśli rekordu NIE ZNALEZIONO: Tworzymy nowy rekord.
        userId,
        productId,
        quantity,
      },
    });
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
    try {
    return this.prisma.cartItem.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
    } catch {
      // Jeśli nie znaleziono rekordu, zwróć null
      return null;
    }
  }

  async clearCart(userId: number) {
    return this.prisma.cartItem.deleteMany({
      where: { userId },
    });
  }
}
