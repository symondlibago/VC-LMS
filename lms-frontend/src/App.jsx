import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  Home,
  ChevronLeft,
  ChevronRight,
  LogOut,
  BookOpen,
  ClipboardList,
  History
} from 'lucide-react'
import { Button } from '@/components/ui/button.jsx'
import './App.css'

import Dashboard from './components/pages/Dashboard'
import Books from './components/pages/Books' 
import Borrowings from './components/pages/Borrowings'
import LoginPage from './components/LoginPage'
import BorrowHistory from './components/pages/BorrowHistory'
import { logout, isAuthenticated, getUser } from './utils/auth'

// Navigation items with role-based access
const navigationItems = [
  { path: '/', icon: Home, label: 'Dashboard', color: 'text-white', roles: ['admin'] },
  { path: '/books', icon: BookOpen, label: 'Book Catalog', color: 'text-white', roles: ['admin'] },
  { path: '/borrowings', icon: ClipboardList, label: 'Active Borrowings', color: 'text-white', roles: ['admin'] },
  { path: '/history', icon: History, label: 'Borrow History', color: 'text-white', roles: ['admin'] },
]

function Sidebar({ isCollapsed, toggleSidebar, onLogout, isMobile, closeMobileSidebar, userRole }) {
  const location = useLocation()

  // Filter navigation items based on user role
  const filteredNavItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  )

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed && !isMobile ? 80 : isMobile && !isCollapsed ? '100%' : 280, x: isMobile && isCollapsed ? '-100%' : 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-full bg-[var(--color-sidebar)] border-r border-[var(--color-sidebar-border)] z-50 flex flex-col"
    >
      {/* Header with toggle button */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-sidebar-border)] h-16">
        <AnimatePresence mode="wait">
          {(!isCollapsed || isMobile) && (
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="text-lg font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] bg-clip-text text-white"
            >
              Library System {/* <--- Updated Title */}
            </motion.h1>
          )}
        </AnimatePresence>

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="text-[var(--color-sidebar-foreground)] hover:bg-[var(--color-sidebar-accent)] ml-auto"
        >
          {isCollapsed && !isMobile ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 p-2 space-y-1">
        {filteredNavItems.map((item, index) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 + 0.1 }}
            >
              <Link to={item.path} onClick={isMobile ? closeMobileSidebar : undefined}>
              <motion.div
                  whileHover={{ scale: 1.02, x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-white text-[#7f1d1d] border border-[#7f1d1d]'
                    : 'hover:bg-[var(--color-sidebar-accent)]/50 text-white'
                }`}

                >

                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-[#7f1d1d]' : item.color}`} />

                  <AnimatePresence mode="wait">
                    {(!isCollapsed || isMobile) && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className={`font-medium whitespace-nowrap ${isActive ? 'text-[#7f1d1d]' : 'text-[var(--color-sidebar-foreground)]'}`}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Active indicator */}
                  {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className={`absolute right-2 w-2 h-2 rounded-full bg-[#7f1d1d]`}
                  />
                )}

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && !isMobile && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-[var(--color-sidebar-accent)] text-[var(--color-sidebar-accent-foreground)] text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </motion.div>
              </Link>
            </motion.div>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-2 border-t border-[var(--color-sidebar-border)]">
        <motion.button
          whileHover={{ scale: 1.02, x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onLogout}
          className="relative flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 group w-full hover:bg-[var(--color-destructive)]/20 text-white cursor-pointer"
        >
          <LogOut className="h-5 w-5 flex-shrink-0 text-white" />

          {/* Animated Logout Text (only if expanded) */}
          <AnimatePresence mode="wait">
            {(!isCollapsed || isMobile) && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="font-medium whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>

          {/* Tooltip for collapsed state */}
          {isCollapsed && !isMobile && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-[var(--color-sidebar-accent)] text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
              Logout
            </div>
          )}
        </motion.button>
      </div>

      {/* Footer status indicator */}
      <div className="p-4 border-t border-[var(--color-sidebar-border)]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`${isCollapsed && !isMobile ? 'flex justify-center' : ''}`}
        >
          {isCollapsed && !isMobile ? (
            <div className="flex flex-col space-y-1">
              <div className="w-2 h-2 bg-[var(--color-chart-1)] rounded-full animate-pulse"></div>
              <div
                className="w-2 h-2 bg-[var(--color-chart-2)] rounded-full animate-pulse"
                style={{ animationDelay: '0.2s' }}
              ></div>
              <div
                className="w-2 h-2 bg-[var(--color-chart-3)] rounded-full animate-pulse"
                style={{ animationDelay: '0.4s' }}
              ></div>
            </div>
          ) : (
            <div className="p-3 bg-[var(--color-sidebar-accent)]/10 rounded-lg border border-[var(--color-sidebar-border)] text-sm text-white text-center">
              <p>
                Made with <span className="text-red-500">❤</span><span className="font-semibold"></span>
              </p>
            </div>
          )}
        </motion.div>
      </div>

    </motion.div>
  )
}

function MainContent({ sidebarCollapsed, onLogout, isMobile, userRole }) {
  const location = useLocation()

  // Role-based route protection
  const ProtectedComponent = ({ component: Component, allowedRoles }) => {
    if (!allowedRoles.includes(userRole)) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      )
    }
    return <Component />
  }

  return (
    <motion.main
      initial={false}
      animate={{
        marginLeft: isMobile ? 0 : (sidebarCollapsed ? 80 : 280),
        width: isMobile ? '100%' : (sidebarCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 280px)')
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="min-h-screen"
    >
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="p-6"
      >
        <Routes>
          {/* Default route for designer - redirect to tasks */}
          {userRole === 'designer' && (
            <Route path="/" element={<Navigate to="/tasks" replace />} />
          )}
          
          {/* Admin routes */}
          <Route path="/" element={<ProtectedComponent component={Dashboard} allowedRoles={['admin']} />} />
          <Route path="/books" element={<ProtectedComponent component={Books} allowedRoles={['admin']} />} />
          <Route path="/borrowings" element={<ProtectedComponent component={Borrowings} allowedRoles={['admin']} />} />
          <Route path="/history" element={<ProtectedComponent component={BorrowHistory} allowedRoles={['admin']} />} />
        </Routes>
      </motion.div>
    </motion.main>
  )
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [user, setUser] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkAuth = () => {
      if (isAuthenticated()) {
        const userData = getUser()
        setIsLoggedIn(true)
        setUser(userData)
      } else {
        setIsLoggedIn(false)
        setUser(null)
      }
      setLoading(false)
    }

    checkAuth()

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true) 
    } else {
      setSidebarCollapsed(false) 
    }
  }, [isMobile])

  const handleLogin = (userData) => {
    setIsLoggedIn(true)
    setUser(userData)
  }

  const handleLogout = async () => {
    await logout()
    setIsLoggedIn(false)
    setUser(null)
    setSidebarCollapsed(false)
  }

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const closeMobileSidebar = () => {
    if (isMobile) {
      setSidebarCollapsed(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#991b1b]"></div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <Router>
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
        {isLoggedIn && isMobile && (
          <div className="mobile-menu-button-container">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="mobile-menu-button"
            >
              {sidebarCollapsed ? <Menu className="h-6 w-6" /> : <X className="h-6 w-6" />}
            </Button>
          </div>
        )}
        
        <Sidebar
          isCollapsed={sidebarCollapsed}
          toggleSidebar={toggleSidebar}
          onLogout={handleLogout}
          isMobile={isMobile}
          closeMobileSidebar={closeMobileSidebar}
          userRole={user?.role}
        />
        <MainContent
          sidebarCollapsed={sidebarCollapsed}
          onLogout={handleLogout}
          isMobile={isMobile}
          userRole={user?.role}
        />
      </div>
    </Router>
  )
}

export default App