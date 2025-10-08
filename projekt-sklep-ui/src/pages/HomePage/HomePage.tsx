import { Link } from 'react-router-dom'

import ProductCard from '../../components/ProductCard'

import styles from './HomePage.module.css'
import { useHomePage } from './useHomePage'

export default function HomePage() {
  const { featuredProducts, isLoading, handleAddToCart } = useHomePage()

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Witaj w E-Zaliczenie</h1>
        <p className={styles.heroDescription}>
          Prosty przykład sklepu internetowego w React
        </p>
      </div>

      {isLoading
        ? (
          <div className={styles.loadingSection}>
            <p className={styles.loadingText}>Ładowanie produktów...</p>
          </div>
        )
        : featuredProducts.length > 0
          ? (
            <div>
              <h2 className={styles.sectionTitle}>Polecane produkty</h2>
              <div className={styles.productsGrid}>
                {featuredProducts.map(product => (
                  <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                ))}
              </div>
              <div className={styles.ctaSection}>
                <Link to="/products" className={styles.ctaButton}>
                  Zobacz wszystkie produkty
                </Link>
              </div>
            </div>
          )
          : (
            <div className={styles.loadingSection}>
              <p className={styles.loadingText}>Brak produktów</p>
              <Link to="/products" className={styles.ctaButton}>
                Zobacz wszystkie produkty
              </Link>
            </div>
          )}
    </div>
  )
}
