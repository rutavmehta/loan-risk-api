import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: number
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const CURRENT_USER_KEY = 'user'
const TOKEN_KEY = 'token'
const SESSION_TIME_KEY = 'sessionTime'

interface LoginResponse {
  user: User
  token: {
    access_token: string
    token_type: string
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem(CURRENT_USER_KEY)
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser) as User
        setUser(parsed)
      } catch {
        setUser(null)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      console.log('Calling Netlify login function at /.netlify/functions/login')
      const res = await fetch('/.netlify/functions/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      console.log('Login response received', res)

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const msg = data?.detail || 'Login failed'
        throw new Error(msg)
      }

      const data = (await res.json()) as LoginResponse

      setUser(data.user)
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user))
      localStorage.setItem(TOKEN_KEY, data.token.access_token)
      localStorage.setItem(SESSION_TIME_KEY, new Date().toISOString())
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      console.log('Calling Netlify register function at /.netlify/functions/register')
      const res = await fetch('/.netlify/functions/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      })
      console.log('Register response received', res)

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        const msg = data?.detail || 'Registration failed'
        throw new Error(msg)
      }

      const data = (await res.json()) as LoginResponse

      setUser(data.user)
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user))
      localStorage.setItem(TOKEN_KEY, data.token.access_token)
      localStorage.setItem(SESSION_TIME_KEY, new Date().toISOString())
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(CURRENT_USER_KEY)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(SESSION_TIME_KEY)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
