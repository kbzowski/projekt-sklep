import { Link } from 'react-router-dom'

import styles from './NotFoundPage.module.css'
import { ROUTES } from '../../lib/routes'


export default function NotFoundPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>404</h1>
      <p className={styles.description}>Strona nie została znaleziona</p>
      <Link to={ROUTES.HOME} className={styles.link}>
        Wróć do strony głównej
      </Link>
    </div>
  )
}
