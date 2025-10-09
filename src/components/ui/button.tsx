'use client'
import { cn } from '@/lib/cn'
import * as React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'solid' | 'outline' | 'ghost'
  size?: 'sm' | 'md'
}

export function Button({ variant='solid', size='md', className, ...props }: Props) {
  const base = 'inline-flex items-center justify-center rounded-full transition-colors focus-visible:outline-none'
  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
  }[size]
  const variants = {
    solid: 'bg-black text-white hover:opacity-90 disabled:opacity-50',
    outline: 'border border-black/10 text-brand-900 hover:bg-black/5 disabled:opacity-50',
    ghost: 'text-brand-900 hover:bg-black/5 disabled:opacity-50',
  }[variant]
  return <button className={cn(base, sizes, variants, className)} {...props} />
}