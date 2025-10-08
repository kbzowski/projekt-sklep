import { Test, TestingModule } from '@nestjs/testing';

import { ProductController } from './product.controller';
import { ProductService } from './product.service';

/**
 * TESTOWANIE KONTROLERA - różnica od testów serwisu:
 *
 * W testach serwisu mockujemy bazę danych (PrismaService)
 * W testach kontrolera mockujemy serwis (ProductService)
 *
 * Dlaczego?
 * - Kontroler to "warstwa prezentacji" - odbiera requesty, wywołuje serwis, zwraca response
 * - Nie testujemy logiki biznesowej (to robi serwis)
 * - Testujemy czy kontroler poprawnie przekazuje parametry i zwraca wyniki
 */

// MOCKOWANIE SERWISU - "udajemy" że ProductService działa
const mockProductService = {
  findAll: jest.fn(),   // Mock metody serwisu
  findOne: jest.fn(),   // Kontrolujemy co zwracają
};

describe('ProductController', () => {
  let controller: ProductController;                  // Kontroler który testujemy
  let service: typeof mockProductService;             // Mock serwisu

  beforeEach(async () => {
    // KONFIGURACJA MODUŁU TESTOWEGO
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],               // Prawdziwy kontroler
      providers: [
        { provide: ProductService, useValue: mockProductService },  // Mock serwisu
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService, typeof mockProductService>(ProductService);

    jest.clearAllMocks();  // Reset mocków przed każdym testem
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated products', async () => {
      // 1. PRZYGOTOWANIE DANYCH TESTOWYCH
      // To co "udajemy" że serwis zwróci
      const mockResult = {
        products: [
          { id: 1, name: 'Test Product', price: 99.99 }
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      };

      // 2. KONFIGURUJEMY MOCK SERWISU
      // Mówimy: "gdy wywołam service.findAll(), zwróć mockResult"
      service.findAll.mockResolvedValue(mockResult);

      // 3. WYWOŁUJEMY METODĘ KONTROLERA
      // Testujemy czy kontroler poprawnie przekazuje parametry
      const result = await controller.findAll({ page: 1, limit: 6 });

      // 4. SPRAWDZAMY REZULTAT
      // Kontroler powinien zwrócić to co zwrócił serwis (bez zmian)
      expect(result).toEqual(mockResult);

      // 5. SPRAWDZAMY CZY SERWIS ZOSTAŁ WYWOŁANY Z POPRAWNYMI PARAMETRAMI
      // To najważniejsze w teście kontrolera!
      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 6 });
    });
  });

  describe('findOne', () => {
    it('should return single product', async () => {
      // PRZYGOTOWANIE MOCK PRODUKTU
      const mockProduct = {
        id: 1,
        name: 'Test Product',
        price: 99.99,
        category: 'electronics',
      };

      // KONFIGURACJA MOCKA - serwis zwróci mockProduct
      service.findOne.mockResolvedValue(mockProduct);

      // WYWOŁANIE KONTROLERA - przekazujemy id produktu
      const result = await controller.findOne(1);

      // SPRAWDZENIE - kontroler zwrócił to co serwis
      expect(result).toEqual(mockProduct);
      // SPRAWDZENIE - serwis został wywołany z poprawnym id
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should handle non-existent product', async () => {
      // TESTOWANIE PRZYPADKU BRZEGOWEGO
      // Serwis zwraca null (produkt nie istnieje)
      service.findOne.mockResolvedValue(null);

      const result = await controller.findOne(999);

      // Kontroler powinien przepuścić null bez zmian
      expect(result).toBeNull();
      expect(service.findOne).toHaveBeenCalledWith(999);
    });
  });
});

/**
 * PODSUMOWANIE - RÓŻNICE MIĘDZY TESTAMI:
 *
 * 🔧 TEST SERWISU (ProductService):
 * - Mockujemy bazę danych (PrismaService)
 * - Testujemy logikę biznesową (transformacja danych, filtrowanie, paginacja)
 * - Sprawdzamy czy poprawne zapytania idą do bazy
 * - Focus: "Czy serwis przetwarza dane poprawnie?"
 *
 * 🌐 TEST KONTROLERA (ProductController):
 * - Mockujemy serwis (ProductService)
 * - Testujemy przekazywanie parametrów między warstwami
 * - Sprawdzamy czy kontroler wywołuje serwis z poprawnymi argumentami
 * - Focus: "Czy kontroler jest poprawnym łącznikiem między HTTP a serwisem?"
 *
 * 📊 HIERARCHIA TESTÓW:
 * Request → Controller → Service → Database
 *     ↑         ↑         ↑        ↑
 *   E2E     Controller   Service  Integration
 *   Test      Test       Test     Test
 *
 * 🎯 KORZYŚCI TAKIEGO PODEJŚCIA:
 * - Każda warstwa jest testowana oddzielnie
 * - Gdy test pada, wiemy dokładnie gdzie jest problem
 * - Testy są szybkie (mocki zamiast prawdziwych zależności)
 * - Można testować edge cases dla każdej warstwy osobno
 */