import * as React from "react"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

const buttonVariants = ({
  variant = "default",
  size = "default",
}: {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
} = {}) => {
  const baseClasses = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

  const variantClasses = {
    default: "bg-gradient-to-r from-[#B84DFF] to-[#00FFE7] text-white hover:opacity-90",
    outline: "border border-[#00FFE7]/20 bg-transparent hover:bg-white/5 text-white",
    ghost: "text-white/70 hover:text-white hover:bg-white/10",
  }

  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
  }

  return clsx(baseClasses, variantClasses[variant], sizeClasses[size])
}

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline" | "ghost"
    size?: "default" | "sm" | "lg"
  }
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <button
      className={twMerge(buttonVariants({ variant, size }), className)}
      ref={ref}
      {...props}
    />
  )
})

Button.displayName = "Button"

export { Button, buttonVariants }
