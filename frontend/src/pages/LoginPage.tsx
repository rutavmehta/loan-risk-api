import React, { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)
    try {
      await login(email, password)
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main glowing orbs */}
        <div className="absolute top-40 left-1/2 w-96 h-96 bg-primary-500/8 rounded-full blur-3xl -translate-x-1/2 animate-floating"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-600/8 rounded-full blur-3xl animate-pulse-scale"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-purple-500/6 rounded-full blur-3xl animate-floating" style={{ animationDelay: '1s' }}></div>
        
        {/* Animated grid background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            animation: 'moveGrid 20s linear infinite'
          }}></div>
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header with enhanced animations */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600 mb-6 shadow-lg animate-bounce-in group hover:animate-pulse-scale relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-400 to-purple-400 opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
            <span className="text-3xl font-bold text-white relative z-10 group-hover:animate-rotate">⚡</span>
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-primary-300 via-primary-400 to-purple-400 bg-clip-text text-transparent mb-2 animate-slide-in-left">
            LoanGuard
          </h1>
          <p className="text-transparent bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-lg font-semibold animate-slide-in-right">
            Smart Loan Risk Prediction 🚀
          </p>
        </div>

        {/* Login Card with enhanced effects */}
        <div className="card glass-light space-y-6">
          <div className="relative">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400 text-sm">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative">
            {/* Email Input */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-primary-400 transition-colors">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-400 transition-colors" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-primary-400 transition-colors">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary-400 transition-colors" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input pl-10 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 group-focus-within:text-primary-400 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-400 hover:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded bg-dark-700 border border-dark-600 accent-primary-500"
                  disabled={isLoading}
                />
                Remember me
              </label>
              <a href="#" className="text-primary-400 hover:text-primary-300">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full group disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-purple-500 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-rainbow"></div>
              <div className="relative flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span className="font-bold">Sign In</span>
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-dark-800 text-gray-400">
                Don't have an account?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <Link
            to="/register"
            className="btn btn-secondary w-full justify-center"
          >
            Create Account
          </Link>
        </div>

      </div>
    </div>
  )
}
