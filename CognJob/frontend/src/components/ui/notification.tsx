// src/components/ui/notification.tsx
import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface NotificationProps {
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'error'
  onClose?: () => void
  className?: string
}

const Notification = React.forwardRef<HTMLDivElement, NotificationProps>(
  ({ title, description, variant = 'default', onClose, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "fixed bottom-4 right-4 z-50 max-w-md rounded-lg border p-4 shadow-lg animate-in fade-in slide-in-from-bottom-5",
          {
            'bg-background text-foreground': variant === 'default',
            'bg-green-50 dark:bg-green-900 text-green-900 dark:text-green-50': variant === 'success',
            'bg-red-50 dark:bg-red-900 text-red-900 dark:text-red-50': variant === 'error',
          },
          className
        )}
        {...props}
      >
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-2 top-2 rounded-md p-1 opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {title && (
          <div className="mb-1 font-medium">{title}</div>
        )}
        {description && (
          <div className="text-sm opacity-90">{description}</div>
        )}
      </div>
    )
  }
)
Notification.displayName = "Notification"

export { Notification }

