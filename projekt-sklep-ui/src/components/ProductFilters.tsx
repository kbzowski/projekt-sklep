import styles from '../pages/ProductsPage/ProductsPage.module.css'
import type {Category, ProductOrderBy} from '../types'

interface ProductFiltersProps {
  categories: Category[]
  currentCategory: string | null
  sortBy: string
  isPending?: boolean
  onCategoryChange: (category: string | null) => void
  onSortChange: (sort: ProductOrderBy) => void
}


export default function ProductFilters({
  categories,
  currentCategory,
  sortBy,
  isPending = false,
  onCategoryChange,
  onSortChange,
}: ProductFiltersProps) {
  return (
    <div className={`${styles.filters} ${isPending ? styles.filtersPending : ''}`}>
      <select
        className={styles.select}
        value={currentCategory || ''}
        onChange={e => onCategoryChange(e.target.value || null)}
        disabled={isPending}
      >
        <option value="">Wszystkie kategorie</option>
        {categories.map(category => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>

      <select
        className={styles.select}
        value={sortBy}
        onChange={e => onSortChange(e.target.value as ProductOrderBy)}
        disabled={isPending}
      >
        <option value="name">Sortuj po nazwie</option>
        <option value="price-asc">Cena: od najniższej</option>
        <option value="price-desc">Cena: od najwyższej</option>
      </select>
    </div>
  )
}
