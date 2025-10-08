import styles from '../../pages/CartPage/CartPage.module.css'
import type { CartItem as CartItemType } from '../../types'
import Button from '../Button'

interface CartItemProps {
  item: CartItemType
  onUpdateQuantity: (productId: number, quantity: number) => void
  onRemove: (productId: number) => void
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { product, quantity } = item

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity > 0) {
      onUpdateQuantity(product.id, newQuantity)
    }
  }

  return (
    <div className={styles.cartItem} data-testid="cart-item">
      <img
        src={product.image || '/placeholder.svg'}
        alt={product.name}
        className={styles.itemImage}
      />

      <div className={styles.itemDetails}>
        <h3 className={styles.itemName} data-testid="product-title">{product.name}</h3>
        <div className={styles.itemCategory}>{product.category}</div>
        <div className={styles.itemPrice} data-testid="product-price">
          {product.price.toFixed(2)}
          {' '}
          zł
        </div>
      </div>

      <div className={styles.quantityControls}>
        <Button
          variant="secondary"
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={quantity <= 1}
        >
          -
        </Button>
        <span className={styles.quantity} data-testid="cart-quantity">{quantity}</span>
        <Button
          variant="secondary"
          onClick={() => handleQuantityChange(quantity + 1)}
        >
          +
        </Button>
      </div>

      <Button variant="danger" onClick={() => onRemove(product.id)}>
        Usuń
      </Button>
    </div>
  )
}
