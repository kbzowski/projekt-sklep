import styles from '../../pages/ProductsPage/ProductsPage.module.css'
import Button from '../Button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  disabled?: boolean
  onPageChange: (page: number) => void
}

/**
 * Komponent paginacji
 */
export default function Pagination({
  currentPage,
  totalPages,
  disabled = false,
  onPageChange,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className={styles.pagination}>
      <Button
        variant="secondary"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={disabled || currentPage === 1}
      >
        Poprzednia
      </Button>

      {pages.map(page => (
        <Button
          key={page}
          variant={page === currentPage ? 'primary' : 'secondary'}
          onClick={() => onPageChange(page)}
          disabled={disabled}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="secondary"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={disabled || currentPage === totalPages}
      >
        Następna
      </Button>
    </div>
  )
}
