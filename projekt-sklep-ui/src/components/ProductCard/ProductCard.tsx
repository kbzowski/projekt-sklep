import styles from './ProductCard.module.css'
import type { Product } from '../../types'
import Button from '../Button'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className={styles.card} data-testid="product-card">
      <img
        src={product.image || '/placeholder.svg'}
        alt={product.name}
        className={styles.image}
      />
      <div className={styles.cardContent}>
        <div className={styles.category}>{product.category}</div>
        <h3 className={styles.productName} data-testid="product-title">{product.name}</h3>
        <p className={styles.description}>{product.description}</p>
        <div className={styles.price} data-testid="product-price">
          {product.price.toFixed(2)}
          {' '}
          zł
        </div>
        <Button variant="primary" onClick={() => onAddToCart(product)} fullWidth>
          Dodaj do koszyka
        </Button>
      </div>
    </div>
  )
}
