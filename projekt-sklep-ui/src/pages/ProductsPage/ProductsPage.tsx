import styles from './ProductsPage.module.css'
import { useProductsPage } from './useProductsPage'
import Pagination from '../../components/Pagination'
import ProductCard from '../../components/ProductCard'
import ProductFilters from '../../components/ProductFilters'

/**
 * Strona listy produktów z filtrami i paginacją
 */
export default function ProductsPage() {
  const {
    products,
    categories,
    currentCategory,
    sortBy,
    currentPage,
    totalPages,
    isLoading,
    isPending,
    handleAddToCart,
    handleCategoryChange,
    handleSortChange,
    handlePageChange,
  } = useProductsPage()

  // Inicjalizacja - pokazuj informacje o ładowaniu
  if (isLoading && products.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Produkty</h1>
        </div>
        <div className={styles.noProducts} data-testid="loading">
          <p>Ładowanie produktów...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Produkty</h1>
        <ProductFilters
          categories={categories}
          currentCategory={currentCategory}
          sortBy={sortBy}
          onCategoryChange={handleCategoryChange}
          onSortChange={handleSortChange}
          isPending={isPending}
        />
      </div>

      {products.length === 0
        ? (
          <div className={styles.noProducts}>
            <p>Brak produktów w wybranej kategorii</p>
          </div>
        )
        : (
          <>
            <div className={`${styles.grid} ${isPending ? styles.gridPending : ''}`}>
              {products.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                disabled={isPending}
              />
            )}
          </>
        )}
    </div>
  )
}
