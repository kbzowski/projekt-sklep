import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { CategoryService } from './category.service';

const mockPrismaService = {
  category: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
};

describe('CategoryService', () => {
  let service: CategoryService;
  let prismaService: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    prismaService = module.get<PrismaService, typeof mockPrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        { id: 1, name: 'Electronics', slug: 'electronics' },
        { id: 2, name: 'Clothing', slug: 'clothing' },
      ];

      prismaService.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAll();

      expect(result).toEqual(mockCategories);
      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
    });

    it('should handle empty categories', async () => {
      prismaService.category.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return single category', async () => {
      const mockCategory = {
        id: 1,
        name: 'Electronics',
        slug: 'electronics',
      };

      prismaService.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findOne(1);

      expect(result).toEqual(mockCategory);
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { products: true },
      });
    });

    it('should return null for non-existent category', async () => {
      prismaService.category.findUnique.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });
});