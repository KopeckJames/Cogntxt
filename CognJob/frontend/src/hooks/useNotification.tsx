import React, { createContext, useContext, useState, useCallback } from 'react'
import { Notification } from '@/components/ui/notification'

type NotificationType = {
  id: number
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'error'
}

interface NotificationContextType {
  showNotification: (notification: Omit<NotificationType, 'id'>) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationType[]>([])

  const showNotification = useCallback((notification: Omit<NotificationType, 'id'>) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { ...notification, id }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }, [])

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          title={notification.title}
          description={notification.description}
          variant={notification.variant}
          onClose={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
        />
      ))}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}