import React from 'react'

import styles from './Button.module.css'

/**
 * Prosty komponent Button - demonstruje podstawy CSS modules
 *
 * Uproszczono do 3 wariantów i basic functionality
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  fullWidth?: boolean
  children: React.ReactNode
}

export default function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const fullWidthClass = fullWidth ? styles.fullWidth : ''

  return (
    <button
      className={`${styles.button} ${styles[variant]} ${fullWidthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
