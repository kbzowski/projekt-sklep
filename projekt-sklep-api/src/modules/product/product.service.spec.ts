import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';

import { ProductService } from './product.service';

/**
 * MOCKOWANIE - Wyjaśnienie koncepów:
 *
 * Mock = "udawany" obiekt, który zastępuje prawdziwą zależność w testach
 * Dlaczego mockujemy?
 * - Nie chcemy łączyć się z prawdziwą bazą danych w testach jednostkowych
 * - Chcemy kontrolować co zwracają funkcje (testować różne scenariusze)
 * - Testy są szybsze i bardziej przewidywalne
 */

// 1. TWORZENIE MOCK OBIEKTU
// Tworzymy "udawany" PrismaService z tylko tymi metodami, których potrzebujemy
const mockPrismaService = {
  product: {
    findMany: jest.fn(),    // jest.fn() = funkcja "szpiegująca" - możemy kontrolować co zwraca
    count: jest.fn(),       // i sprawdzać jak została wywołana
    findUnique: jest.fn(),
  },
};

describe('ProductService', () => {
  let service: ProductService;                    // Prawdziwy serwis, który testujemy
  let prismaService: typeof mockPrismaService;    // Nasz mock PrismaService

  beforeEach(async () => {
    // 2. KONFIGURACJA TESTOWEGO MODUŁU NESTJS
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,  // Prawdziwy serwis
        // 3. DEPENDENCY INJECTION - podmieniamy PrismaService na nasz mock
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    // 4. POBIERAMY INSTANCJE Z MODUŁU
    service = module.get<ProductService>(ProductService);
    prismaService = module.get<PrismaService, typeof mockPrismaService>(PrismaService);

    // 5. CZYSZCZENIE MOCKÓW - resetujemy przed każdym testem
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      // 6. PRZYGOTOWYWANIE DANYCH TESTOWYCH
      // Tworzymy przykładowe dane, które ma zwrócić nasza mock baza
      const mockProducts = [
        {
          id: 1,
          name: 'Test Product',
          price: 99.99,
          description: 'Test',
          image: 'test.jpg',
          categoryId: 1,
          category: { id: 1, name: 'Electronics', slug: 'electronics' },
        },
      ];

      // 7. KONFIGUROWANIE MOCKÓW - mówimy co mają zwrócić
      prismaService.product.findMany.mockResolvedValue(mockProducts);
      prismaService.product.count.mockResolvedValue(1);

      // 8. WYWOŁANIE TESTOWANEJ METODY
      const result = await service.findAll({ page: 1, limit: 6 });

      // 9. SPRAWDZENIE REZULTATU
      // Testujemy czy ProductService poprawnie przetwarza dane z "bazy"
      expect(result).toEqual({
        products: [
          {
            id: 1,
            name: 'Test Product',
            price: 99.99,
            category: 'electronics',      // Zauważ: service zmienia category object na string
            categoryId: 1,
            image: 'test.jpg',
            description: 'Test',
          },
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      });

      // 10. SPRAWDZENIE JAK MOCK ZOSTAŁ WYWOŁANY
      // Testujemy czy service przekazał poprawne parametry do Prisma
      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { name: 'asc' },
        skip: 0,                          // (page-1) * limit = (1-1) * 6 = 0
        take: 6,
        include: { category: true },
      });
    });

    it('should filter by category', async () => {
      // 11. TESTOWANIE RÓŻNYCH SCENARIUSZY
      // Możemy łatwo testować różne przypadki bo kontrolujemy mock
      prismaService.product.findMany.mockResolvedValue([]);
      prismaService.product.count.mockResolvedValue(0);

      // Wywołujemy z parametrem filtrowania
      await service.findAll({ category: 'electronics' });

      // 12. SPRAWDZAMY CZY FILTROWANIE DZIAŁA
      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          category: { slug: 'electronics' },    // Service powinien przekształcić filtr
        },
        orderBy: { name: 'asc' },
        skip: 0,
        take: 6,
        include: { category: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return single product', async () => {
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        price: 99.99,
        description: 'Test',
        image: 'test.jpg',
        categoryId: 1,
        category: { id: 1, name: 'Electronics', slug: 'electronics' },
      };

      // 13. MOCK ZWRACA JEDEN PRODUKT
      prismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.findOne(1);

      // 14. SPRAWDZAMY TRANSFORMACJĘ DANYCH
      expect(result).toEqual({
        id: 1,
        name: 'Test Product',
        price: 99.99,
        category: 'electronics',    // Service przekształca { slug: 'electronics' } → 'electronics'
        categoryId: 1,
        image: 'test.jpg',
        description: 'Test',
      });

      // 15. SPRAWDZAMY PARAMETRY WYWOŁANIA
      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { category: true },
      });
    });

    it('should return null for non-existent product', async () => {
      // 16. TESTOWANIE PRZYPADKU BRZEGOWEGO
      // Mock zwraca null - symulujemy brak produktu w bazie
      prismaService.product.findUnique.mockResolvedValue(null);

      const result = await service.findOne(999);

      // Service powinien przepuścić null bez zmian
      expect(result).toBeNull();
    });
  });
});

/**
 * PODSUMOWANIE MOCKOWANIA:
 *
 * ✅ CO TESTUJEMY:
 * - Logikę biznesową ProductService (transformacja danych, paginacja)
 * - Poprawne wywołania do PrismaService
 * - Obsługę różnych scenariuszy (sukces, brak danych)
 *
 * ❌ CZEGO NIE TESTUJEMY:
 * - Czy Prisma rzeczywiście zapisuje do bazy
 * - Czy zapytania SQL są poprawne
 * - Performance bazy danych
 *
 * 🎯 KORZYŚCI MOCKOWANIA:
 * - Testy są szybkie (brak I/O do bazy)
 * - Przewidywalne (kontrolujemy co zwracają funkcje)
 * - Fokus na logice biznesowej (nie na infrastrukturze)
 * - Można łatwo testować edge cases
 */