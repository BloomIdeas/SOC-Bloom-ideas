import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "glass" | "gradient" | "neon"
    hover?: boolean
  }
>(({ className, variant = "default", hover = true, ...props }, ref) => (
  <motion.div
    ref={ref}
    className={cn(
      "rounded-2xl border bg-card text-card-foreground shadow-sm relative overflow-hidden",
      variant === "glass" && "backdrop-blur-md bg-white/80 border-white/20 shadow-lg",
      variant === "gradient" && "bg-gradient-to-br from-white via-emerald-50/50 to-teal-50/50 border-emerald-200/50",
      variant === "neon" && "bg-white/90 border-emerald-300 shadow-lg shadow-emerald-500/20",
      hover && "transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1",
      className
    )}
    whileHover={hover ? { 
      y: -4,
      transition: { duration: 0.2 }
    } : undefined}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "gradient" | "pattern"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6 relative",
      variant === "gradient" && "bg-gradient-to-r from-emerald-50 to-teal-50",
      variant === "pattern" && "bg-gradient-to-r from-emerald-50 to-teal-50 before:absolute before:inset-0 before:bg-[url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%2306b6d4\" fill-opacity=\"0.1\" fill-rule=\"evenodd\"%3E%3Ccircle cx=\"3\" cy=\"3\" r=\"1\"/%3E%3C/g%3E%3C/svg%3E')] before:opacity-50",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "gradient" | "animated"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <motion.div
    ref={ref}
    className={cn(
      "text-2xl font-bold leading-none tracking-tight",
      variant === "gradient" && "bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent",
      variant === "animated" && "bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent",
      className
    )}
    whileHover={variant === "animated" ? { 
      scale: 1.05,
      transition: { duration: 0.2 }
    } : undefined}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "spaced" | "compact"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "p-6 pt-0",
      variant === "spaced" && "space-y-4",
      variant === "compact" && "p-4 pt-0",
      className
    )} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 gap-2", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// New enhanced card components
const CardBadge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "success" | "warning" | "info" | "error"
    icon?: React.ReactNode
  }
>(({ className, variant = "default", icon, children, ...props }, ref) => {
  const variantStyles = {
    default: "bg-emerald-100 text-emerald-800 border-emerald-200",
    success: "bg-green-100 text-green-800 border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
    info: "bg-blue-100 text-blue-800 border-blue-200",
    error: "bg-red-100 text-red-800 border-red-200"
  }

  return (
    <motion.div
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border",
        variantStyles[variant],
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {icon && <span className="text-xs">{icon}</span>}
      {children}
    </motion.div>
  )
})
CardBadge.displayName = "CardBadge"

const CardMetric = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    icon?: React.ReactNode
    value: string | number
    label: string
    trend?: "up" | "down" | "neutral"
  }
>(({ className, icon, value, label, trend, ...props }, ref) => (
  <motion.div
    ref={ref}
    className={cn(
      "flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-white to-emerald-50/50 border border-emerald-100",
      className
    )}
    whileHover={{ scale: 1.02, y: -2 }}
    {...props}
  >
    {icon && (
      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center text-white">
        {icon}
      </div>
    )}
    <div className="flex-1">
      <div className="text-2xl font-bold text-emerald-900">{value}</div>
      <div className="text-sm text-emerald-600">{label}</div>
    </div>
    {trend && (
      <div className={cn(
        "text-xs font-medium px-2 py-1 rounded-full",
        trend === "up" && "bg-green-100 text-green-700",
        trend === "down" && "bg-red-100 text-red-700",
        trend === "neutral" && "bg-gray-100 text-gray-700"
      )}>
        {trend === "up" && "↗"}
        {trend === "down" && "↘"}
        {trend === "neutral" && "→"}
      </div>
    )}
  </motion.div>
))
CardMetric.displayName = "CardMetric"

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardBadge,
  CardMetric
}
