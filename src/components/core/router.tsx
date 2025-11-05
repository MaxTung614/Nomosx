import React, { useState, useEffect } from 'react'
import { AdminLoginPage } from '../auth/admin-login-page'
import { AdminDashboard } from '../admin/admin-dashboard'
import { MainApp } from './main-app'
import { ProductPage } from './product-page'
import { PaymentPage } from '../payment/payment-page'
import { PaymentResultPage } from '../payment/payment-result-page'
import { PayPalReturnHandler } from '../payment/paypal-return-handler'
import { PayPalCancelHandler } from '../payment/paypal-cancel-handler'
import { useAuth } from '../auth/auth-provider'

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
      navigate('/admin-dashboard')
    } else {
      console.log('User does not have admin/cs role, redirecting to home')
      // Regular user redirected to home
      navigate('/')
    }
  }

  // Handle admin logout
  const handleAdminLogout = () => {
    logout()
    navigate('/')
  }

  // Extract order ID from payment paths
  const getOrderIdFromPath = (path: string, prefix: string) => {
    if (path.startsWith(prefix)) {
      return path.substring(prefix.length)
    }
    return null
  }

  // Route rendering logic
  const renderRoute = () => {
    // Check for payment routes with order ID
    const paymentOrderId = getOrderIdFromPath(currentPath, '/payment/')
    const resultOrderId = getOrderIdFromPath(currentPath, '/payment-result/')
    
    if (paymentOrderId) {
      // Payment page: /payment/:orderId
      return (
        <PaymentPage 
          orderId={paymentOrderId}
          onNavigateBack={() => navigate('/products')}
          onPaymentSuccess={(orderId) => navigate(`/payment-result/${orderId}`)}
        />
      )
    }
    
    if (resultOrderId) {
      // Payment result page: /payment-result/:orderId
      return (
        <PaymentResultPage 
          orderId={resultOrderId}
          onNavigateHome={() => navigate('/')}
          onRetryPayment={() => navigate(`/payment/${resultOrderId}`)}
        />
      )
    }
    
    switch (currentPath) {
      case '/payment-success':
        // PayPal return success handler
        return (
          <PayPalReturnHandler 
            onPaymentSuccess={(orderId) => navigate(`/payment-result/${orderId}`)}
            onPaymentCancel={(orderId) => navigate(`/payment/${orderId}`)}
          />
        )
      
      case '/payment-cancel':
        // PayPal cancel handler
        return (
          <PayPalCancelHandler 
            onReturnToPayment={(orderId) => navigate(`/payment/${orderId}`)}
            onReturnHome={() => navigate('/')}
          />
        )
      case '/enen':
        // Admin/CS login page - no navigation
        return (
          <AdminLoginPage 
            onLoginSuccess={handleAdminLoginSuccess}
          />
        )
      
      case '/admin-dashboard':
        // Admin dashboard - requires admin/cs role
        if (!isAuthenticated) {
          // Not authenticated, redirect to admin login
          navigate('/enen')
          return null
        }
        
        if (userRole !== 'admin' && userRole !== 'cs') {
          // Not admin/cs role, redirect to home
          navigate('/')
          return null
        }
        
        return (
          <AdminDashboard 
            onLogout={handleAdminLogout}
          />
        )
      
      case '/products':
        // Product page for customers
        return (
          <ProductPage 
            onNavigateBack={() => navigate('/')}
            onNavigateToPayment={(orderId) => navigate(`/payment/${orderId}`)}
          />
        )
      
      default:
        // Main application (home and other regular pages)
        return (
          <MainApp 
            onNavigateToAdmin={() => navigate('/enen')}
            onNavigateToProducts={() => navigate('/products')}
          />
        )
    }
  }

  return (
    <div className="min-h-screen">
      {renderRoute()}
    </div>
  )
}