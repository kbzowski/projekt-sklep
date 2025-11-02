import { Injectable } from '@nestjs/common';
import type { Prisma, Product } from '@prisma/client';

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

  /**
   * PRZYKŁAD wykorzystania bezpiecznego sparametryzowanych SQL z parametrami ($queryRaw) do pobrania produktów
   */
  async searchProductsRaw(searchTerm: string) {

    // W przypadku sparametryzowanego zapytania SQL typy muszą być podane
    type ProductResult = Pick<Product, 'id' | 'name' | 'price'>;

    // Dla zaawansowanych: https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/typedsql

    return this.prisma.$queryRaw<ProductResult[]>`
      SELECT id, name, price
      FROM Product
      WHERE name LIKE ${'%' + searchTerm + '%'}
      ORDER BY name LIMIT 10
    `;
  }


  /**
   * PRZYKŁAD wykorzystania bezpiecznego $executeRaw dla operacji modyfikujących dane
   */
  async updateProductPriceRaw(productId: number, newPrice: number) {
    const affectedRows = await this.prisma.$executeRaw`
      UPDATE Product
      SET price = ${newPrice}
      WHERE id = ${productId}
    `;

    return { affectedRows };
  }

}
