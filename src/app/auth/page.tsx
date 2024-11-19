'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  })
  const [error, setError] = useState('')
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [resetData, setResetData] = useState({
    email: '',
    newPassword: ''
  })
  const [resetMessage, setResetMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          action: isLogin ? 'login' : 'register',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      // Handle successful auth (e.g., save token, redirect)
      router.push('/dashboard') // Redirect to dashboard or home page
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setResetMessage('')
    console.log(resetData);
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: resetData.email,
          newPassword: resetData.newPassword
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to reset password')
      }

      const data = await response.json()
      setResetMessage(data.message)
      setResetData({ email: '', newPassword: '' })
      // Optionally redirect to login after successful password reset
      setTimeout(() => setIsForgotPassword(false), 2000)
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (isForgotPassword) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
        <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-2xl shadow-lg border border-green-100">
          <h2 className="text-center text-3xl font-bold text-green-800">
            Reset Password
          </h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
          
          {resetMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
              {resetMessage}
            </div>
          )}

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <input
              type="email"
              required
              className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-green-200 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300"
              placeholder="Enter your email"
              value={resetData.email}
              onChange={(e) => setResetData(prev => ({ ...prev, email: e.target.value }))}
            />
            
            <input
              type="password"
              required
              className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-green-200 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300"
              placeholder="Enter new password"
              value={resetData.newPassword}
              onChange={(e) => setResetData(prev => ({ ...prev, newPassword: e.target.value }))}
            />
            
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150"
            >
              Update Password
            </button>
          </form>

          <div className="text-center">
            <button
              className="text-green-600 hover:text-green-700 font-medium transition-colors duration-150"
              onClick={() => setIsForgotPassword(false)}
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-green-800 mb-2">🌾 Farm Market</h1>
        <p className="text-green-600">Connect with local farmers and buyers</p>
      </div>

      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-2xl shadow-lg border border-green-100">
        <div>
          <h2 className="text-center text-3xl font-bold text-green-800">
            {isLogin ? 'Sign in to your account' : 'Register new account'}
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <input
              name="email"
              type="email"
              required
              className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-green-200 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
            />
            
            {!isLogin && (
              <>
                <input
                  name="firstName"
                  type="text"
                  required
                  className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-green-200 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <input
                  name="lastName"
                  type="text"
                  required
                  className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-green-200 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                />
                <input
                  name="phoneNumber"
                  type="text"
                  required
                  className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-green-200 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300"
                  placeholder="Phone Number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
              </>
            )}

            <input
              name="password"
              type="password"
              required
              className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-green-200 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150"
          >
            {isLogin ? 'Sign in' : 'Register'}
          </button>
        </form>

        <div className="text-center space-y-2">
          <button
            className="text-green-600 hover:text-green-700 font-medium transition-colors duration-150"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Need to register?' : 'Already have an account?'}
          </button>
          
          {isLogin && (
            <button
              className="block w-full text-green-600 hover:text-green-700 font-medium transition-colors duration-150"
              onClick={() => setIsForgotPassword(true)}
            >
              Forgot your password?
            </button>
          )}
        </div>
      </div>
    </div>
  )
}