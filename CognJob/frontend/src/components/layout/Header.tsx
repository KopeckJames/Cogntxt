// src/components/layout/Header.tsx
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/ui/theme-provider"
import { Moon, Sun } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function Header() {
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <header className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div 
            className="font-bold text-2xl cursor-pointer"
            onClick={() => navigate('/')}
          >
            CognJob
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
            <Button onClick={() => navigate('/login')}>Sign In</Button>
            <Button onClick={() => navigate('/register')} variant="outline">
              Register
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}