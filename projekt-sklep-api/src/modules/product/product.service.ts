import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { ProductFilterDto } from './dto/product-filter.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: ProductFilterDto) {
    const { category, sortBy, search, page, limit } = filter;
    const skip = ((page || 1) - 1) * (limit || 6);

    // Warunki filtrowania
    const where: Prisma.ProductWhereInput = {};
    if (category) {
      where.category = {
        slug: category,
      };
    }

    // Wyszukiwanie po nazwie lub opisie
    // SQLite: case-insensitive dla ASCII domyślnie
    // Dla Unicode (polskie znaki): konwersja do lowercase po obu stronach
    if (search && search.trim()) {
      const searchLower = search.toLowerCase();
      where.OR = [
        {
          name: {
            contains: searchLower,
          },
        },
        {
          description: {
            contains: searchLower,
          },
        },
      ];
    }

    // Sortowanie
    let orderBy: Prisma.ProductOrderByWithRelationInput = { name: 'asc' };
    if (sortBy === 'price-asc') {
      orderBy = { price: 'asc' };
    }
    else if (sortBy === 'price-desc') {
      orderBy = { price: 'desc' };
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit || 6,
        include: {
          category: true,
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products: products.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category.slug,
        categoryId: product.categoryId,
        image: product.image,
        description: product.description,
      })),
      total,
      page: page || 1,
      totalPages: Math.ceil(total / (limit || 6)),
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) return null;

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category.slug,
      categoryId: product.categoryId,
      image: product.image,
      description: product.description,
    };
  }
}
