import { type ChangeEvent } from 'react'

import styles from './SearchBar.module.css'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  isPending?: boolean
}

/**
 * SearchBar - komponent pola wyszukiwania
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = 'Szukaj produktów...',
  isPending = false,
}: SearchBarProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className={styles.container}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`${styles.input} ${isPending ? styles.inputPending : ''}`}
      />
      {isPending && <span className={styles.spinner}>🔍</span>}
    </div>
  )
}
