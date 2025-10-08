import { Link } from 'react-router-dom'

import Button from '../../components/Button'
import CartItem from '../../components/CartItem'

import styles from './CartPage.module.css'
import { useCartPage } from './useCartPage'

export default function CartPage() {
  const {
    cart,
    isLoading,
    totalItems,
    totalPrice,
    handleUpdateQuantity,
    handleRemoveItem,
    handleClearCart,
  } = useCartPage()

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Koszyk</h1>
        <div className={styles.emptyCart}>
          <p>Ładowanie koszyka...</p>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Koszyk</h1>
        <div className={styles.emptyCart}>
          <p>Twój koszyk jest pusty</p>
          <Link to="/products">Przejdź do sklepu</Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Koszyk</h1>

      <div className={styles.cartLayout}>
        <div>
          <div className={styles.cartItems}>
            {cart.map(item => (
              <CartItem
                key={item.product.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>
        </div>

        <div>
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>Podsumowanie</h2>

            <div className={styles.summaryRow}>
              <span>Liczba produktów:</span>
              <span>{totalItems}</span>
            </div>

            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Łączna kwota:</span>
              <span data-testid="cart-total">
                {totalPrice.toFixed(2)}
                {' '}
                zł
              </span>
            </div>

            <Button
              variant="primary"
              className={styles.button}
              fullWidth
              disabled
            >
              Przejdź do płatności
            </Button>

            <Button variant="secondary" onClick={handleClearCart} fullWidth>
              Wyczyść koszyk
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
