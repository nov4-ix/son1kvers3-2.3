import React from 'react'
import { clsx } from 'clsx'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glitch' | 'glass'
  children: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  children,
  header,
  footer,
  className,
  ...props
}) => {
  const baseClasses = 'son1k-card'
  
  const variantClasses = {
    default: '',
    glitch: 'son1k-glitch',
    glass: 'backdrop-blur-xl bg-opacity-20'
  }
  
  return (
    <div
      className={clsx(baseClasses, variantClasses[variant], className)}
      {...props}
    >
      {header && (
        <div className="mb-4 pb-4 border-b border-cyan/20">
          {header}
        </div>
      )}
      
      <div className="space-y-4">
        {children}
      </div>
      
      {footer && (
        <div className="mt-4 pt-4 border-t border-cyan/20">
          {footer}
        </div>
      )}
    </div>
  )
}
