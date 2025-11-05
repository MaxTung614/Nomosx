import React, { useState, useEffect, lazy, Suspense } from 'react'
import { useAuth } from '../auth/auth-provider'
import { PageLoadingFallback } from '../utils/loading-fallback'

// ====================================================================================================
// 代码拆分 - 懒加载所有路由组件
// ====================================================================================================
// 这样可以将每个页面打包成独立的 chunk，减少首次加载时间

// 认证相关页面
const AdminLoginPage = lazy(() => import('../auth/admin-login-page').then(m => ({ default: m.AdminLoginPage })))

// 管理后台页面
const AdminDashboard = lazy(() => import('../admin/admin-dashboard').then(m => ({ default: m.AdminDashboard })))

// 核心业务页面
const MainApp = lazy(() => import('./main-app').then(m => ({ default: m.MainApp })))
const ProductPage = lazy(() => import('./product-page').then(m => ({ default: m.ProductPage })))

// 支付相关页面
const PaymentPage = lazy(() => import('../payment/payment-page').then(m => ({ default: m.PaymentPage })))
const PaymentResultPage = lazy(() => import('../payment/payment-result-page').then(m => ({ default: m.PaymentResultPage })))
const PayPalReturnHandler = lazy(() => import('../payment/paypal-return-handler').then(m => ({ default: m.PayPalReturnHandler })))
const PayPalCancelHandler = lazy(() => import('../payment/paypal-cancel-handler').then(m => ({ default: m.PayPalCancelHandler })))

export function Router() {
  const [currentPath, setCurrentPath] = useState('')
  const { userRole, isAuthenticated, logout } = useAuth()

  // Listen for path changes
  useEffect(() => {
    const updatePath = () => {
      setCurrentPath(window.location.pathname)
    }

    updatePath()
    window.addEventListener('popstate', updatePath)
    
    return () => {
      window.removeEventListener('popstate', updatePath)
    }
  }, [])

  // Navigation helper
  const navigate = (path: string) => {
    window.history.pushState({}, '', path)
    setCurrentPath(path)
  }

  // Handle admin login success
  const handleAdminLoginSuccess = async (role: string) => {
    console.log('Admin login successful, role:', role)
    console.log('Auth state - isAuthenticated:', isAuthenticated, 'userRole:', userRole)
    
    // Add a small delay to ensure auth state has propagated
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Check user role and redirect accordingly
    if (role === 'admin' || role === 'cs') {
      console.log('Redirecting to admin dashboard')
      navigate('/enen')
    } else {
      console.log('User does not have admin/cs role, redirecting to home')
      // Regular user redirected to home
      navigate('/')
    }
  }

  // Handle logout
  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  // Route matching with Suspense for lazy loading
  const renderRoute = () => {
    // Admin routes - Protected (using /enen path)
    if (currentPath === '/enen') {
      console.log('[Router] /enen route - isAuthenticated:', isAuthenticated, 'userRole:', userRole)
      
      // Check if user is authenticated and has admin/cs role
      if (!isAuthenticated) {
        console.log('[Router] Not authenticated, showing admin login')
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <AdminLoginPage onLoginSuccess={handleAdminLoginSuccess} />
          </Suspense>
        )
      }

      if (userRole !== 'admin' && userRole !== 'cs') {
        console.log('[Router] User does not have admin/cs role, redirecting to home')
        navigate('/')
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <MainApp onNavigateToAdmin={() => navigate('/enen')} />
          </Suspense>
        )
      }

      console.log('[Router] Rendering AdminDashboard for role:', userRole)
      return (
        <Suspense fallback={<PageLoadingFallback />}>
          <AdminDashboard onLogout={handleLogout} />
        </Suspense>
      )
    }

    // Product page
    if (currentPath.startsWith('/products/')) {
      const productId = currentPath.split('/products/')[1]
      return (
        <Suspense fallback={<PageLoadingFallback />}>
          <ProductPage
            productId={productId}
            onBack={() => navigate('/')}
          />
        </Suspense>
      )
    }

    // Payment routes
    if (currentPath.startsWith('/payment/')) {
      const orderId = currentPath.split('/payment/')[1]
      return (
        <Suspense fallback={<PageLoadingFallback />}>
          <PaymentPage
            orderId={orderId}
            onBack={() => navigate('/')}
          />
        </Suspense>
      )
    }

    if (currentPath === '/payment-result') {
      return (
        <Suspense fallback={<PageLoadingFallback />}>
          <PaymentResultPage onBackToHome={() => navigate('/')} />
        </Suspense>
      )
    }

    // PayPal callback routes
    if (currentPath === '/paypal-return') {
      return (
        <Suspense fallback={<PageLoadingFallback />}>
          <PayPalReturnHandler />
        </Suspense>
      )
    }

    if (currentPath === '/paypal-cancel') {
      return (
        <Suspense fallback={<PageLoadingFallback />}>
          <PayPalCancelHandler />
        </Suspense>
      )
    }

    // Default: Home page
    return (
      <Suspense fallback={<PageLoadingFallback />}>
        <MainApp onNavigateToAdmin={() => navigate('/enen')} />
      </Suspense>
    )
  }

  return <>{renderRoute()}</>
}
