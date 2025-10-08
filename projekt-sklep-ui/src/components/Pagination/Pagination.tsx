import styles from '../../pages/ProductsPage/ProductsPage.module.css'
import Button from '../Button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className={styles.pagination}>
      <Button
        variant="secondary"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Poprzednia
      </Button>

      {pages.map(page => (
        <Button
          key={page}
          variant={page === currentPage ? 'primary' : 'secondary'}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}

      <Button
        variant="secondary"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Następna
      </Button>
    </div>
  )
}
