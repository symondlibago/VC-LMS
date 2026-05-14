import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Lock, User, ArrowRight, KeyRound, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import API_BASE_URL from '../services/Config'

const LoginPage = ({ onLogin }) => {
  // States
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [secondPassword, setSecondPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Flow Control States
  const [loginStep, setLoginStep] = useState(1) // 1: Email/Pass, 2: 2nd Password
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const payload = { email, password }
      if (loginStep === 2) payload.second_password = secondPassword

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.requires_second_password) {
        setLoginStep(2) // Move to 2nd password step
      } else if (data.success) {
        localStorage.setItem('auth_token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        onLogin(data.user)
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Network error. Please check if the backend server is running.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccessMessage('')
    
    try {
      const response = await fetch(`${API_BASE_URL}/reset-password-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, second_password: secondPassword, new_password: newPassword }),
      })
      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage('Password reset successfully! You can now log in.')
        setTimeout(() => handleBackToLogin(), 2000)
      } else {
        setError(data.message || 'Verification failed. Check your email or PIN.')
      }
    } catch (err) {
      setError('Network error. Please check if the backend server is running.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    setIsForgotPassword(false)
    setLoginStep(1)
    setError('')
    setSuccessMessage('')
    setPassword('')
    setSecondPassword('')
    setNewPassword('')
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50/50 relative overflow-hidden font-mono">
      
      {/* --- Ambient Background Effects --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-10 opacity-40">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#7f1d1d]/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#991b1b]/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-[#b91c1c]/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>
        
        {/* Floating Particles */}
        <div className="floating-element absolute top-10 left-10 w-4 h-4 bg-[#7f1d1d]/10 rounded-full"></div>
        <div className="floating-element absolute bottom-20 right-20 w-6 h-6 bg-[#991b1b]/10 rounded-full"></div>
        <div className="floating-element absolute top-1/2 right-10 w-3 h-3 bg-[#b91c1c]/10 rounded-full"></div>
      </div>

      {/* --- Centered Login Card --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="snake-border-card bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl">
          <div className="snake-line"></div>
          <div className="snake-line"></div>
          <div className="snake-line"></div>
          <div className="snake-line"></div>
          
          <div className="motion-lines opacity-50">
            <div className="motion-line"></div>
            <div className="motion-line"></div>
            <div className="motion-line"></div>
          </div>
          
          <div className="enhanced-card-content p-8 md:p-10">
            {/* Logo Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center mb-8"
            >
              <div className="mb-6 relative inline-block">
                <div className="absolute inset-0 bg-[#991b1b]/20 rounded-full blur-xl transform scale-110"></div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
                {isForgotPassword ? 'Reset Password' : loginStep === 2 ? 'Security Verification' : 'Library Management'}
              </h1>
              <p className="text-gray-500 text-sm">
                {isForgotPassword ? 'Verify identity using 2nd Password' : loginStep === 2 ? 'Enter your 6-digit PIN to continue' : 'Vineyard International Polytechnic College'}
              </p>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3"
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </motion.div>
              )}

              {/* Success Message */}
              {successMessage && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-green-700 text-sm font-medium">{successMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Area Container */}
            <AnimatePresence mode="wait">
              
              {/* --- STANDARD LOGIN FORM --- */}
              {!isForgotPassword && (
                <motion.form
                  key={loginStep === 1 ? "login-step-1" : "login-step-2"}
                  initial={{ opacity: 0, x: loginStep === 1 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: loginStep === 1 ? 20 : -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleLogin}
                  className="space-y-6"
                >
                  
                  {loginStep === 1 ? (
                    <>
                      {/* Email Field */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                          Email Address
                        </label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 z-10 text-gray-400 group-focus-within:text-[#991b1b] transition-colors" />
                          <Input
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="enhanced-input pl-12 h-12 bg-gray-50/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#991b1b] focus:ring-4 focus:ring-[#991b1b]/10 rounded-xl transition-all duration-300"
                            required
                          />
                        </div>
                      </div>

                      {/* Password Field */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                          Password
                        </label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 z-10 text-gray-400 group-focus-within:text-[#991b1b] transition-colors" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="enhanced-input pl-12 pr-12 h-12 bg-gray-50/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#991b1b] focus:ring-4 focus:ring-[#991b1b]/10 rounded-xl transition-all duration-300"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#991b1b] transition-colors z-10"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Options */}
                      <div className="flex items-center justify-between pt-2">
                        <label className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer group">
                          <div className="relative flex items-center">
                            <input type="checkbox" className="peer h-4 w-4 rounded border-gray-300 text-[#991b1b] focus:ring-[#991b1b]/20" />
                          </div>
                          <span className="group-hover:text-gray-700 transition-colors">Remember me</span>
                        </label>
                        <button 
                          type="button"
                          onClick={() => { setIsForgotPassword(true); setError(''); setSuccessMessage(''); }}
                          className="text-sm font-medium text-[#991b1b] hover:text-[#7f1d1d] hover:underline transition-all"
                        >
                          Forgot password?
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Step 2: 2nd Password Field */
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                        6-Digit 2nd Password
                      </label>
                      <div className="relative group">
                        <KeyRound className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 z-10 text-gray-400 group-focus-within:text-[#991b1b] transition-colors" />
                        <Input
                          type="password"
                          maxLength={6}
                          placeholder="••••••"
                          value={secondPassword}
                          onChange={(e) => setSecondPassword(e.target.value)}
                          className="enhanced-input pl-12 h-12 text-center tracking-[1em] text-lg bg-gray-50/50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#991b1b] focus:ring-4 focus:ring-[#991b1b]/10 rounded-xl transition-all duration-300"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex flex-col space-y-3 pt-2">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="cursor-pointer enhanced-button w-full h-12 bg-gradient-to-r from-[#7f1d1d] to-[#991b1b] hover:from-[#991b1b] hover:to-[#b91c1c] text-white font-bold rounded-xl shadow-lg shadow-[#7f1d1d]/20 hover:shadow-[#7f1d1d]/30 hover:-translate-y-0.5 transition-all duration-300"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <span>{loginStep === 1 ? 'Continue' : 'Verify & Sign In'}</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </Button>

                    {loginStep === 2 && (
                      <button
                        type="button"
                        onClick={() => setLoginStep(1)}
                        className="flex items-center justify-center space-x-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-all py-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back</span>
                      </button>
                    )}
                  </div>
                </motion.form>
              )}

              {/* --- FORGOT PASSWORD FORM (PIN VERIFICATION) --- */}
              {isForgotPassword && (
                <motion.form
                  key="reset-password-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleResetPassword}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Account Email</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 z-10 text-gray-400 group-focus-within:text-[#991b1b] transition-colors" />
                      <Input type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="enhanced-input pl-12 h-12 bg-gray-50/50 border-gray-200 text-gray-900 focus:bg-white focus:border-[#991b1b] focus:ring-4 focus:ring-[#991b1b]/10 rounded-xl transition-all duration-300" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">6-Digit 2nd Password</label>
                    <div className="relative group">
                      <KeyRound className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 z-10 text-gray-400 group-focus-within:text-[#991b1b] transition-colors" />
                      <Input type="password" maxLength={6} placeholder="••••••" value={secondPassword} onChange={(e) => setSecondPassword(e.target.value)} className="enhanced-input pl-12 h-12 bg-gray-50/50 border-gray-200 text-gray-900 focus:bg-white focus:border-[#991b1b] focus:ring-4 focus:ring-[#991b1b]/10 rounded-xl transition-all duration-300" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">New Login Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 z-10 text-gray-400 group-focus-within:text-[#991b1b] transition-colors" />
                      <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="enhanced-input pl-12 pr-12 h-12 bg-gray-50/50 border-gray-200 text-gray-900 focus:bg-white focus:border-[#991b1b] focus:ring-4 focus:ring-[#991b1b]/10 rounded-xl transition-all duration-300" required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#991b1b] transition-colors z-10">
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3 pt-2">
                    <Button type="submit" disabled={isLoading} className="cursor-pointer enhanced-button w-full h-12 bg-gradient-to-r from-[#7f1d1d] to-[#991b1b] hover:from-[#991b1b] hover:to-[#b91c1c] text-white font-bold rounded-xl shadow-lg shadow-[#7f1d1d]/20 hover:shadow-[#7f1d1d]/30 hover:-translate-y-0.5 transition-all duration-300">
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Updating...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <span>Confirm New Password</span>
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      )}
                    </Button>
                    <button type="button" onClick={handleBackToLogin} className="flex items-center justify-center space-x-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-all py-2">
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to Login</span>
                    </button>
                  </div>
                </motion.form>
              )}

            </AnimatePresence>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-8 text-center"
            >
              <p className="text-xs text-gray-400">
                © 2026 Library Management System. All rights reserved.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage