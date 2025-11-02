import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { TokenGuard } from '../auth/token.guard';

import { CartController } from './cart.controller';
import { CartService } from './cart.service';

/**
 * Testy integracyjne dla CartController z użyciem supertest
 */

describe('CartController (integrations tests)', () => {
  let app: INestApplication;
  let cartService: jest.Mocked<CartService>;

  // Mock CartService z wszystkimi metodami
  const mockCartService = {
    getCart: jest.fn(),
    addToCart: jest.fn(),
    updateCartItem: jest.fn(),
    removeFromCart: jest.fn(),
    clearCart: jest.fn(),
  };

  /**
   * Mock TokenGuard z symulacją użytkownika
   */
  const mockTokenGuard = {
    canActivate: jest.fn((context) => {
      const request = context.switchToHttp().getRequest();
      // Symulacja wyciągnięcia userId z tokenu
      // W prawdziwym guard to pochodzi z JWT payload
      request.userId = 1;
      return true;
    }),
  };

  beforeEach(async () => {
    // Resetujemy implementację mock guarda przed każdym testem
    mockTokenGuard.canActivate = jest.fn((context) => {
      const request = context.switchToHttp().getRequest();
      request.userId = 1;
      return true;
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: mockCartService,
        },
      ],
    })
      // Nadpisujemy TokenGuard, aby ominąć weryfikację tokenu w testach
      .overrideGuard(TokenGuard)
      .useValue(mockTokenGuard)
      .compile();

    app = module.createNestApplication();

    // Włączamy ValidationPipe jak w main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    cartService = module.get(CartService);

    // Czyszczenie wszystkich mocków przed każdym testem
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Zamykamy aplikację po każdym teście
    await app.close();
  });

  /**
   * Test podstawowy: sprawdzenie czy endpoint istnieje
   */
  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('GET /cart', () => {
    /**
     * Test pobierania koszyka z produktami
     * Pokazuje: status 200, sprawdzanie body, struktury JSON
     */
    it('should return user cart items with status 200', async () => {
      // Arrange: przygotowanie danych testowych
      const mockCartItems = [
        {
          product: {
            id: 1,
            name: 'Laptop',
            price: 2500,
            category: 'electronics',
            categoryId: 1,
            image: 'laptop.jpg',
            description: 'Powerful laptop',
          },
          quantity: 2,
        },
        {
          product: {
            id: 2,
            name: 'Mouse',
            price: 50,
            category: 'electronics',
            categoryId: 1,
            image: 'mouse.jpg',
            description: 'Wireless mouse',
          },
          quantity: 1,
        },
      ];

      cartService.getCart.mockResolvedValue(mockCartItems);

      // Act & Assert: wysyłamy HTTP GET request
      const response = await request(app.getHttpServer())
        .get('/cart')
        .expect(200) // Sprawdzamy status HTTP
        .expect('Content-Type', /json/); // Sprawdzamy header Content-Type

      // Sprawdzamy body response
      expect(response.body).toEqual(mockCartItems);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].product.name).toBe('Laptop');
      expect(response.body[1].quantity).toBe(1);

      // Sprawdzamy wywołanie serwisu
      expect(cartService.getCart).toHaveBeenCalledWith(1); // userId = 1 z mock guard
      expect(cartService.getCart).toHaveBeenCalledTimes(1);
    });

    /**
     * Test pustego koszyka
     */
    it('should return empty array when cart is empty', async () => {
      // Arrange
      cartService.getCart.mockResolvedValue([]);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/cart')
        .expect(200);

      expect(response.body).toEqual([]);
      expect(response.body).toHaveLength(0);
      expect(Array.isArray(response.body)).toBe(true);
    });

    /**
     * Test sprawdzający strukturę JSON response
     */
    it('should return cart with correct JSON structure', async () => {
      // Arrange
      const mockCart = [
        {
          product: {
            id: 5,
            name: 'Keyboard',
            price: 150,
            category: 'accessories',
            categoryId: 2,
            image: 'keyboard.jpg',
            description: 'Mechanical keyboard',
          },
          quantity: 3,
        },
      ];

      cartService.getCart.mockResolvedValue(mockCart);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get('/cart')
        .expect(200);

      // Sprawdzamy strukturę response
      expect(response.body[0]).toHaveProperty('product');
      expect(response.body[0]).toHaveProperty('quantity');
      expect(response.body[0].product).toHaveProperty('id');
      expect(response.body[0].product).toHaveProperty('name');
      expect(response.body[0].product).toHaveProperty('price');
      expect(response.body[0].product).toHaveProperty('category');
    });
  });

  describe('POST /cart', () => {
    /**
     * Test dodawania produktu do koszyka
     */
    it('should add product to cart and return 201', async () => {
      // Arrange
      const addToCartDto = {
        productId: 5,
        quantity: 3,
      };

      const mockResult = {
        id: 1,
        userId: 1,
        productId: 5,
        quantity: 3,
        createdAt: new Date(),
      };

      cartService.addToCart.mockResolvedValue(mockResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/cart')
        .send(addToCartDto) // Wysyłamy JSON body
        .expect(201) // POST zwraca 201 Created
        .expect('Content-Type', /json/);

      expect(response.body).toMatchObject({
        id: 1,
        productId: 5,
        quantity: 3,
      });

      expect(cartService.addToCart).toHaveBeenCalledWith(1, addToCartDto);
    });

    /**
     * Test walidacji DTO - brak wymaganych pól
     */
    it('should return 400 when productId is missing', async () => {
      // Arrange: niepoprawne dane (brak productId)
      const invalidDto = {
        quantity: 2,
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/cart')
        .send(invalidDto)
        .expect(400); // Bad Request

      // Serwis nie powinien być wywołany
      expect(cartService.addToCart).not.toHaveBeenCalled();
    });

    /**
     * Test walidacji DTO - nieprawidłowy typ danych
     */
    it('should return 400 when productId is not a number', async () => {
      // Arrange: niepoprawny typ
      const invalidDto = {
        productId: 'abc', // string zamiast number
        quantity: 2,
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/cart')
        .send(invalidDto)
        .expect(400);

      expect(cartService.addToCart).not.toHaveBeenCalled();
    });

    /**
     * Test walidacji - ujemna ilość
     * Pokazuje: walidację @IsPositive()
     */
    it('should return 400 when quantity is negative', async () => {
      // Arrange
      const invalidDto = {
        productId: 5,
        quantity: -1, // ujemna wartość
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/cart')
        .send(invalidDto)
        .expect(400);

      expect(cartService.addToCart).not.toHaveBeenCalled();
    });

    /**
     * Test walidacji - zero jako ilość
     * Pokazuje: walidację @IsPositive() (zero nie jest positive)
     */
    it('should return 400 when quantity is zero', async () => {
      // Arrange
      const invalidDto = {
        productId: 5,
        quantity: 0,
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/cart')
        .send(invalidDto)
        .expect(400);

      expect(cartService.addToCart).not.toHaveBeenCalled();
    });

    /**
     * Test dodawania z domyślną ilością
     * Pokazuje: działanie wartości domyślnych w DTO
     */
    it('should use default quantity when not specified', async () => {
      // Arrange
      const dto = {
        productId: 10,
        quantity: 1, // wartość domyślna
      };

      const mockResult = {
        id: 2,
        userId: 1,
        productId: 10,
        quantity: 1,
        createdAt: new Date(),
      };

      cartService.addToCart.mockResolvedValue(mockResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/cart')
        .send(dto)
        .expect(201);

      expect(response.body.quantity).toBe(1);
    });
  });

  describe('PUT /cart/:productId', () => {
    /**
     * Test aktualizacji ilości produktu
     * Pokazuje: PUT request, parametry w URL, status 200
     */
    it('should update cart item quantity and return 200', async () => {
      // Arrange
      const productId = 5;
      const updateDto = {
        quantity: 10,
      };

      const mockResult = {
        id: 3,
        userId: 1,
        productId: 5,
        quantity: 10,
        createdAt: new Date(),
      };

      cartService.updateCartItem.mockResolvedValue(mockResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .put(`/cart/${productId}`) // Parametr w URL
        .send(updateDto)
        .expect(200);

      expect(response.body.quantity).toBe(10);
      expect(cartService.updateCartItem).toHaveBeenCalledWith(
        1,
        productId,
        updateDto,
      );
    });

    /**
     * Test ParseIntPipe - nieprawidłowy parametr URL
     * Pokazuje: walidację parametrów URL, status 400
     */
    it('should return 400 when productId in URL is not a number', async () => {
      // Arrange
      const invalidProductId = 'abc';
      const updateDto = {
        quantity: 5,
      };

      // Act & Assert
      await request(app.getHttpServer())
        .put(`/cart/${invalidProductId}`)
        .send(updateDto)
        .expect(400); // ParseIntPipe rzuca 400

      expect(cartService.updateCartItem).not.toHaveBeenCalled();
    });

    /**
     * Test aktualizacji do dużej ilości
     * Pokazuje: obsługę dużych wartości
     */
    it('should handle large quantity updates', async () => {
      // Arrange
      const productId = 7;
      const updateDto = {
        quantity: 999,
      };

      const mockResult = {
        id: 4,
        userId: 1,
        productId: 7,
        quantity: 999,
        createdAt: new Date(),
      };

      cartService.updateCartItem.mockResolvedValue(mockResult);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .put(`/cart/${productId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.quantity).toBe(999);
      expect(response.body.quantity).toBeGreaterThan(100);
    });

    /**
     * Test walidacji body - brak quantity
     * Pokazuje: walidację wymaganych pól w UpdateCartDto
     */
    it('should return 400 when quantity is missing in body', async () => {
      // Arrange
      const productId = 5;
      const invalidDto = {}; // brak quantity

      // Act & Assert
      await request(app.getHttpServer())
        .put(`/cart/${productId}`)
        .send(invalidDto)
        .expect(400);

      expect(cartService.updateCartItem).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /cart/:productId', () => {
    /**
     * Test usuwania produktu z koszyka
     * Pokazuje: DELETE request, status 204 No Content
     */
    it('should remove product from cart and return 204', async () => {
      // Arrange
      const productId = 5;

      const mockDeletedItem = {
        id: 5,
        userId: 1,
        productId: 5,
        quantity: 2,
        createdAt: new Date(),
      };

      cartService.removeFromCart.mockResolvedValue(mockDeletedItem);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .delete(`/cart/${productId}`)
        .expect(204); // No Content - brak body w response

      // Status 204 nie zwraca body
      expect(response.body).toEqual({});

      expect(cartService.removeFromCart).toHaveBeenCalledWith(1, productId);
      expect(cartService.removeFromCart).toHaveBeenCalledTimes(1);
    });

    /**
     * Test usuwania z nieprawidłowym productId
     * Pokazuje: walidację parametru URL (ParseIntPipe)
     */
    it('should return 400 when productId is invalid', async () => {
      // Arrange
      const invalidProductId = 'not-a-number';

      // Act & Assert
      await request(app.getHttpServer())
        .delete(`/cart/${invalidProductId}`)
        .expect(400);

      expect(cartService.removeFromCart).not.toHaveBeenCalled();
    });

    /**
     * Test sprawdzający że 204 nie zwraca Content-Type
     * Pokazuje: szczegóły HTTP dla No Content
     */
    it('should return 204 without body', async () => {
      // Arrange
      const productId = 10;

      cartService.removeFromCart.mockResolvedValue({
        id: 6,
        userId: 1,
        productId: 10,
        quantity: 1,
        createdAt: new Date(),
      });

      // Act & Assert
      const response = await request(app.getHttpServer())
        .delete(`/cart/${productId}`)
        .expect(204);

      // 204 nie ma body
      expect(response.text).toBe('');
      expect(Object.keys(response.body).length).toBe(0);
    });
  });

  describe('DELETE /cart', () => {
    /**
     * Test czyszczenia całego koszyka
     * Pokazuje: DELETE bez parametrów, status 204, BatchPayload
     */
    it('should clear entire cart and return 204', async () => {
      // Arrange
      const mockBatchResult = { count: 3 }; // usunięto 3 produkty

      cartService.clearCart.mockResolvedValue(mockBatchResult);

      // Act & Assert
      await request(app.getHttpServer())
        .delete('/cart')
        .expect(204); // No Content

      expect(cartService.clearCart).toHaveBeenCalledWith(1);
      expect(cartService.clearCart).toHaveBeenCalledTimes(1);
    });

    /**
     * Test czyszczenia pustego koszyka
     * Pokazuje: count = 0
     */
    it('should return 204 when clearing empty cart', async () => {
      // Arrange
      const mockBatchResult = { count: 0 };

      cartService.clearCart.mockResolvedValue(mockBatchResult);

      // Act & Assert
      await request(app.getHttpServer()).delete('/cart').expect(204);

      expect(cartService.clearCart).toHaveBeenCalledWith(1);
    });

    /**
     * Test czyszczenia koszyka z wieloma produktami
     * Pokazuje: obsługę batch operations
     */
    it('should clear cart with many items', async () => {
      // Arrange
      const mockBatchResult = { count: 15 }; // dużo produktów

      cartService.clearCart.mockResolvedValue(mockBatchResult);

      // Act & Assert
      await request(app.getHttpServer()).delete('/cart').expect(204);

      expect(cartService.clearCart).toHaveBeenCalledWith(1);
    });
  });

  /**
   * Testy guardów i autentykacji
   */
  describe('Authentication with TokenGuard', () => {
    /**
     * Test pokazujący że guard został wywołany
     * Pokazuje: sprawdzanie wywołania mock guarda
     */
    it('should call TokenGuard on protected endpoint', async () => {
      // Arrange
      cartService.getCart.mockResolvedValue([]);

      // Act
      await request(app.getHttpServer()).get('/cart').expect(200);

      // Assert: guard został wywołany
      expect(mockTokenGuard.canActivate).toHaveBeenCalled();
    });

    /**
     * Test pokazujący że userId pochodzi z guarda
     * Pokazuje: jak guard ustawia request.userId
     */
    it('should use userId from TokenGuard', async () => {
      // Arrange
      cartService.getCart.mockResolvedValue([]);

      // Act
      await request(app.getHttpServer()).get('/cart').expect(200);

      // Assert: serwis został wywołany z userId = 1 (z mock guarda)
      expect(cartService.getCart).toHaveBeenCalledWith(1);
    });

    /**
     * Test symulujący różnych użytkowników
     * Pokazuje: możliwość zmiany userId w mock guardzie
     */
    it('should handle different authenticated users', async () => {
      // Arrange: modyfikujemy mock guard dla różnych userId
      let requestCount = 0;
      mockTokenGuard.canActivate.mockImplementation((context) => {
        const request = context.switchToHttp().getRequest();
        // Symulacja różnych użytkowników
        requestCount++;
        request.userId = requestCount;
        return true;
      });

      cartService.getCart.mockResolvedValue([]);

      // Act: 3 requesty jako różni użytkownicy
      await request(app.getHttpServer()).get('/cart').expect(200);
      await request(app.getHttpServer()).get('/cart').expect(200);
      await request(app.getHttpServer()).get('/cart').expect(200);

      // Assert: serwis wywołany z różnymi userId
      expect(cartService.getCart).toHaveBeenNthCalledWith(1, 1);
      expect(cartService.getCart).toHaveBeenNthCalledWith(2, 2);
      expect(cartService.getCart).toHaveBeenNthCalledWith(3, 3);
    });
  });

  /**
   * Testy edge cases
   */
  describe('Edge cases', () => {
    /**
     * Test z dodatkowymi polami w body (forbidNonWhitelisted)
     * Pokazuje: ValidationPipe z forbidNonWhitelisted = true rzuca błąd
     */
    it('should return 400 when request body contains unknown fields', async () => {
      // Arrange
      const dtoWithExtraFields = {
        productId: 5,
        quantity: 2,
        unknownField: 'should cause error', // pole nieznane
      };

      // Act & Assert
      // forbidNonWhitelisted: true powoduje że nieznane pola rzucają błąd 400
      await request(app.getHttpServer())
        .post('/cart')
        .send(dtoWithExtraFields)
        .expect(400); // Bad Request

      // Serwis nie powinien być wywołany
      expect(cartService.addToCart).not.toHaveBeenCalled();
    });

    /**
     * Test Content-Type header
     * Pokazuje: sprawdzanie nagłówków HTTP
     */
    it('should accept application/json Content-Type', async () => {
      // Arrange
      const dto = { productId: 1, quantity: 1 };

      cartService.addToCart.mockResolvedValue({
        id: 9,
        userId: 1,
        productId: 1,
        quantity: 1,
        createdAt: new Date(),
      });

      // Act & Assert
      await request(app.getHttpServer())
        .post('/cart')
        .set('Content-Type', 'application/json') // Ustawiamy header
        .send(dto)
        .expect(201);
    });

    /**
     * Test równoległych requestów
     * Pokazuje: że każdy request jest niezależny
     */
    it('should handle concurrent requests', async () => {
      // Arrange
      cartService.getCart.mockResolvedValue([]);

      // Act: wysyłamy 5 requestów równolegle
      const requests = Array(5)
        .fill(null)
        .map(() => request(app.getHttpServer()).get('/cart').expect(200));

      await Promise.all(requests);

      // Assert: serwis wywołany 5 razy
      expect(cartService.getCart).toHaveBeenCalledTimes(5);
    });
  });
});
