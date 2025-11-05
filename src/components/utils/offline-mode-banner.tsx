import React, { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '../ui/alert'
import { Button } from '../ui/button'
import { WifiOff, RefreshCw, X } from 'lucide-react'

interface OfflineModeBannerProps {
  show: boolean
  onRetry?: () => void
}

export function OfflineModeBanner({ show, onRetry }: OfflineModeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    if (show) {
      setIsDismissed(false)
    }
  }, [show])

  const handleRetry = async () => {
    setIsRetrying(true)
    if (onRetry) {
      await onRetry()
    }
    setTimeout(() => setIsRetrying(false), 1000)
  }

  if (!show || isDismissed) {
    return null
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <Alert className="bg-orange-50 border-orange-200 shadow-lg">
        <WifiOff className="h-4 w-4 text-orange-600" />
        <AlertDescription className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <p className="font-medium text-orange-900">
              無法連接到認證服務
            </p>
            <p className="text-sm text-orange-700 mt-1">
              您可以繼續瀏覽，但登入功能暫時不可用。請檢查網絡連接或稍後重試。
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                disabled={isRetrying}
                className="border-orange-300 hover:bg-orange-100"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
                重試
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDismissed(true)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}