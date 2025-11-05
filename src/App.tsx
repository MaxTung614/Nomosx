import React, { useState, useEffect } from 'react'
import { AuthProvider } from './components/auth/auth-provider'
import { Router } from './components/core/router'
import { Toaster } from './components/ui/sonner'

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Router />
        <Toaster />
      </div>
    </AuthProvider>
  )
}