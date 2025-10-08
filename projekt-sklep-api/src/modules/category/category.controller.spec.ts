import { Test, TestingModule } from '@nestjs/testing';

import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

const mockCategoryService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
};

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: typeof mockCategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        { provide: CategoryService, useValue: mockCategoryService },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get<CategoryService, typeof mockCategoryService>(CategoryService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        { id: 1, name: 'Electronics', slug: 'electronics' },
        { id: 2, name: 'Clothing', slug: 'clothing' },
      ];

      service.findAll.mockResolvedValue(mockCategories);

      const result = await controller.findAll();

      expect(result).toEqual(mockCategories);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return single category', async () => {
      const mockCategory = {
        id: 1,
        name: 'Electronics',
        slug: 'electronics',
      };

      service.findOne.mockResolvedValue(mockCategory);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockCategory);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should handle non-existent category', async () => {
      service.findOne.mockResolvedValue(null);

      const result = await controller.findOne(999);

      expect(result).toBeNull();
      expect(service.findOne).toHaveBeenCalledWith(999);
    });
  });
});