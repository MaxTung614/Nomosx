import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { projectId, publicAnonKey } from '../../utils/supabase/info'
import { 
  Activity, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Zap,
  Server
} from 'lucide-react'

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'slow' | 'checking'
  responseTime: number
  timestamp: string
  error?: string
}

export function EdgeFunctionHealthCheck() {
  const [healthStatus, setHealthStatus] = useState<HealthCheckResult | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [history, setHistory] = useState<HealthCheckResult[]>([])
  const [autoCheck, setAutoCheck] = useState(false)

  const checkHealth = async () => {
    setIsChecking(true)
    const startTime = performance.now()
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-04b375d8/health`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      )
      
      const responseTime = performance.now() - startTime
      const data = await response.json()
      
      let status: HealthCheckResult['status'] = 'healthy'
      if (responseTime > 3000) {
        status = 'slow'
      } else if (!response.ok || data.status !== 'ok') {
        status = 'unhealthy'
      }
      
      const result: HealthCheckResult = {
        status,
        responseTime,
        timestamp: new Date().toISOString(),
        error: !response.ok ? `HTTP ${response.status}` : undefined
      }
      
      setHealthStatus(result)
      setHistory(prev => [result, ...prev].slice(0, 10))
      
      console.log('[Edge Function] Health check:', result)
    } catch (error) {
      const result: HealthCheckResult = {
        status: 'unhealthy',
        responseTime: performance.now() - startTime,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      
      setHealthStatus(result)
      setHistory(prev => [result, ...prev].slice(0, 10))
      
      console.error('[Edge Function] Health check failed:', error)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    // Initial check
    checkHealth()
  }, [])

  useEffect(() => {
    if (autoCheck) {
      const interval = setInterval(checkHealth, 30000) // Every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoCheck])

  const getStatusIcon = (status: HealthCheckResult['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'slow':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'checking':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
    }
  }

  const getStatusColor = (status: HealthCheckResult['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'unhealthy':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'slow':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'checking':
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getResponseTimeColor = (ms: number) => {
    if (ms < 500) return 'text-green-600'
    if (ms < 1500) return 'text-yellow-600'
    if (ms < 3000) return 'text-orange-600'
    return 'text-red-600'
  }

  const averageResponseTime = history.length > 0
    ? history.reduce((sum, h) => sum + h.responseTime, 0) / history.length
    : 0

  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
          <Server className="h-5 w-5" />
          Edge Function 健康檢查
          <Button
            variant="outline"
            size="sm"
            onClick={checkHealth}
            disabled={isChecking}
            className="ml-auto"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
            檢查
          </Button>
        </CardTitle>
        <CardDescription className="text-blue-700 dark:text-blue-300">
          監控 make-server-04b375d8 Edge Function 狀態
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        {healthStatus && (
          <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                當前狀態
              </h4>
              <Badge variant="outline" className={getStatusColor(healthStatus.status)}>
                {getStatusIcon(healthStatus.status)}
                <span className="ml-1">
                  {healthStatus.status === 'healthy' && '健康'}
                  {healthStatus.status === 'unhealthy' && '異常'}
                  {healthStatus.status === 'slow' && '響應慢'}
                  {healthStatus.status === 'checking' && '檢查中'}
                </span>
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">響應時間:</span>
                <span className={`ml-2 font-mono ${getResponseTimeColor(healthStatus.responseTime)}`}>
                  {healthStatus.responseTime.toFixed(0)}ms
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">檢查時間:</span>
                <span className="ml-2 text-xs">
                  {new Date(healthStatus.timestamp).toLocaleTimeString('zh-TW')}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">端點:</span>
                <span className="ml-2 text-xs font-mono">/health</span>
              </div>
            </div>

            {healthStatus.error && (
              <Alert variant="destructive" className="mt-3">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{healthStatus.error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Performance Metrics */}
        {history.length > 0 && (
          <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              性能指標
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">平均響應:</span>
                <span className={`ml-2 font-mono ${getResponseTimeColor(averageResponseTime)}`}>
                  {averageResponseTime.toFixed(0)}ms
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">最快:</span>
                <span className="ml-2 font-mono text-green-600">
                  {Math.min(...history.map(h => h.responseTime)).toFixed(0)}ms
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">最慢:</span>
                <span className="ml-2 font-mono text-red-600">
                  {Math.max(...history.map(h => h.responseTime)).toFixed(0)}ms
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  健康率: {((history.filter(h => h.status === 'healthy').length / history.length) * 100).toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">
                  (最近 {history.length} 次檢查)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              歷史記錄
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {history.map((check, index) => (
                <div key={index} className="flex items-center justify-between text-xs p-2 rounded bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(check.status)}
                    <span className="text-muted-foreground">
                      {new Date(check.timestamp).toLocaleTimeString('zh-TW')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-mono ${getResponseTimeColor(check.responseTime)}`}>
                      {check.responseTime.toFixed(0)}ms
                    </span>
                    {check.error && (
                      <span className="text-red-600 text-xs">{check.error}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Auto Check Toggle */}
        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border">
          <div>
            <p className="text-sm font-medium">自動檢查</p>
            <p className="text-xs text-muted-foreground">每 30 秒自動檢查一次</p>
          </div>
          <Button
            variant={autoCheck ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoCheck(!autoCheck)}
          >
            {autoCheck ? '已啟用' : '已停用'}
          </Button>
        </div>

        {/* Performance Recommendations */}
        {healthStatus && healthStatus.responseTime > 1000 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>性能建議:</strong> Edge Function 響應時間較慢。
              可能原因：冷啟動、網絡延遲或服務器負載。
              <ul className="list-disc list-inside mt-2 text-xs">
                <li>檢查 Supabase 服務狀態</li>
                <li>考慮啟用 Edge Function 預熱</li>
                <li>檢查本地網絡連接</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}