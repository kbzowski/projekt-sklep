/**
 * API Test Helpers
 *
 * Helper functions for testing with real backend API.
 * These demonstrate:
 * - Direct API calls for test setup
 * - Database state verification
 * - Test data management
 */

import type { APIRequestContext } from '@playwright/test';

const API_BASE_URL = 'http://localhost:9000/api';

/**
 * API client for direct backend calls
 */
export class ApiTestClient {
  constructor(private request: APIRequestContext) {}

  /**
   * Login and get cookies for authenticated requests
   */
  async login(email: string, password: string): Promise<string[]> {
    const credentials = Buffer.from(`${email}:${password}`).toString('base64');

    const response = await this.request.post(`${API_BASE_URL}/auth/login`, {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    if (!response.ok()) {
      throw new Error(`Login failed: ${response.status()}`);
    }

    // Extract cookies from response
    const cookies = response.headers()['set-cookie'];
    return cookies ? cookies.split(',') : [];
  }

  /**
   * Get all products
   */
  async getProducts(params?: Record<string, string | number>) {
    const url = new URL(`${API_BASE_URL}/products`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await this.request.get(url.toString());

    if (!response.ok()) {
      throw new Error(`Get products failed: ${response.status()}`);
    }

    return response.json();
  }

  /**
   * Get all categories
   */
  async getCategories() {
    const response = await this.request.get(`${API_BASE_URL}/categories`);

    if (!response.ok()) {
      throw new Error(`Get categories failed: ${response.status()}`);
    }

    return response.json();
  }

  /**
   * Get user cart (requires authentication)
   */
  async getCart(cookies: string[]) {
    const response = await this.request.get(`${API_BASE_URL}/cart`, {
      headers: {
        Cookie: cookies.join('; '),
      },
    });

    if (!response.ok()) {
      throw new Error(`Get cart failed: ${response.status()}`);
    }

    return response.json();
  }

  /**
   * Add item to cart (requires authentication)
   */
  async addToCart(cookies: string[], productId: number, quantity: number = 1) {
    const response = await this.request.post(`${API_BASE_URL}/cart`, {
      headers: {
        Cookie: cookies.join('; '),
        'Content-Type': 'application/json',
      },
      data: { productId, quantity },
    });

    if (!response.ok()) {
      throw new Error(`Add to cart failed: ${response.status()}`);
    }

    return response.json();
  }

  /**
   * Clear cart (requires authentication)
   */
  async clearCart(cookies: string[]) {
    const response = await this.request.delete(`${API_BASE_URL}/cart`, {
      headers: {
        Cookie: cookies.join('; '),
      },
    });

    if (!response.ok() && response.status() !== 204) {
      throw new Error(`Clear cart failed: ${response.status()}`);
    }
  }

  /**
   * Register new user
   */
  async register(email: string, password: string, name: string) {
    const response = await this.request.post(`${API_BASE_URL}/user`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: { email, password, name },
    });

    if (!response.ok()) {
      throw new Error(`Register failed: ${response.status()}`);
    }

    return response.json();
  }
}

/**
 * Wait for API to be ready
 */
export async function waitForApi(
  request: APIRequestContext,
  maxAttempts = 30
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await request.get(`${API_BASE_URL}/products`);
      if (response.ok()) {
        return true;
      }
    } catch {
      // API not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}