import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { supabase } from '../../utils/supabase/client'
import { projectId, publicAnonKey } from '../../utils/supabase/info'
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  RefreshCw,
  Wifi,
  WifiOff,
  Database
} from 'lucide-react'

interface TestResult {
  name: string
  status: 'success' | 'failure' | 'testing' | 'warning'
  message: string
  time?: number
}

export function SupabaseConnectionTest() {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [overallStatus, setOverallStatus] = useState<'good' | 'issues' | 'critical' | null>(null)

  const runTests = async () => {
    setIsRunning(true)
    setResults([])
    setOverallStatus(null)

    const testResults: TestResult[] = []

    // Test 1: Configuration Check
    console.log('[Test] Starting configuration check...')
    testResults.push({
      name: '配置檢查',
      status: 'testing',
      message: '檢查環境變量...'
    })
    setResults([...testResults])

    await new Promise(resolve => setTimeout(resolve, 100))

    if (projectId && publicAnonKey) {
      testResults[testResults.length - 1] = {
        name: '配置檢查',
        status: 'success',
        message: `Project ID: ${projectId.substring(0, 10)}...`
      }
    } else {
      testResults[testResults.length - 1] = {
        name: '配置檢查',
        status: 'failure',
        message: '環境變量缺失！請檢查 SUPABASE_URL 和 SUPABASE_ANON_KEY'
      }
      setResults([...testResults])
      setIsRunning(false)
      setOverallStatus('critical')
      return
    }
    setResults([...testResults])

    // Test 2: Network Connection
    console.log('[Test] Testing network connection...')
    testResults.push({
      name: '網絡連接',
      status: 'testing',
      message: '測試到 Supabase 的連接...'
    })
    setResults([...testResults])

    const networkStart = performance.now()
    try {
      const response = await fetch(`https://${projectId}.supabase.co/`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      })
      const networkTime = performance.now() - networkStart
      
      if (response.ok || response.status === 404) {
        testResults[testResults.length - 1] = {
          name: '網絡連接',
          status: networkTime > 2000 ? 'warning' : 'success',
          message: `連接成功 (${networkTime.toFixed(0)}ms)${networkTime > 2000 ? ' - 速度較慢' : ''}`,
          time: networkTime
        }
      } else {
        testResults[testResults.length - 1] = {
          name: '網絡連接',
          status: 'failure',
          message: `HTTP ${response.status} - 連接失敗`,
          time: networkTime
        }
      }
    } catch (error) {
      const networkTime = performance.now() - networkStart
      testResults[testResults.length - 1] = {
        name: '網絡連接',
        status: 'failure',
        message: `連接失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
        time: networkTime
      }
    }
    setResults([...testResults])
    await new Promise(resolve => setTimeout(resolve, 300))

    // Test 3: Supabase Client Initialization
    console.log('[Test] Testing Supabase client...')
    testResults.push({
      name: 'Supabase Client',
      status: 'testing',
      message: '檢查客戶端初始化...'
    })
    setResults([...testResults])

    await new Promise(resolve => setTimeout(resolve, 100))

    if (supabase) {
      testResults[testResults.length - 1] = {
        name: 'Supabase Client',
        status: 'success',
        message: '客戶端初始化成功'
      }
    } else {
      testResults[testResults.length - 1] = {
        name: 'Supabase Client',
        status: 'failure',
        message: '客戶端初始化失敗'
      }
    }
    setResults([...testResults])
    await new Promise(resolve => setTimeout(resolve, 300))

    // Test 4: Session Check
    console.log('[Test] Testing session retrieval...')
    testResults.push({
      name: 'Session 檢查',
      status: 'testing',
      message: '嘗試獲取 Session...'
    })
    setResults([...testResults])

    const sessionStart = performance.now()
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      const sessionTime = performance.now() - sessionStart
      
      if (error) {
        testResults[testResults.length - 1] = {
          name: 'Session 檢查',
          status: 'failure',
          message: `錯誤: ${error.message}`,
          time: sessionTime
        }
      } else {
        testResults[testResults.length - 1] = {
          name: 'Session 檢查',
          status: sessionTime > 3000 ? 'warning' : 'success',
          message: session 
            ? `Session 存在 (${sessionTime.toFixed(0)}ms)${sessionTime > 3000 ? ' - 響應較慢' : ''}` 
            : `無 Session (${sessionTime.toFixed(0)}ms)`,
          time: sessionTime
        }
      }
    } catch (error) {
      const sessionTime = performance.now() - sessionStart
      testResults[testResults.length - 1] = {
        name: 'Session 檢查',
        status: 'failure',
        message: `超時或錯誤: ${error instanceof Error ? error.message : '未知錯誤'}`,
        time: sessionTime
      }
    }
    setResults([...testResults])
    await new Promise(resolve => setTimeout(resolve, 300))

    // Test 5: Edge Function Health
    console.log('[Test] Testing Edge Function...')
    testResults.push({
      name: 'Edge Function',
      status: 'testing',
      message: '測試服務器健康狀態...'
    })
    setResults([...testResults])

    const edgeStart = performance.now()
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-04b375d8/health`,
        {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
          signal: AbortSignal.timeout(5000)
        }
      )
      const edgeTime = performance.now() - edgeStart
      const data = await response.json()
      
      if (response.ok && data.status === 'ok') {
        testResults[testResults.length - 1] = {
          name: 'Edge Function',
          status: edgeTime > 1000 ? 'warning' : 'success',
          message: `健康 (${edgeTime.toFixed(0)}ms)${edgeTime > 1000 ? ' - 可能冷啟動' : ''}`,
          time: edgeTime
        }
      } else {
        testResults[testResults.length - 1] = {
          name: 'Edge Function',
          status: 'failure',
          message: `HTTP ${response.status} - ${data.error || '狀態異常'}`,
          time: edgeTime
        }
      }
    } catch (error) {
      const edgeTime = performance.now() - edgeStart
      testResults[testResults.length - 1] = {
        name: 'Edge Function',
        status: 'failure',
        message: `失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
        time: edgeTime
      }
    }
    setResults([...testResults])

    // Determine overall status
    const failures = testResults.filter(r => r.status === 'failure').length
    const warnings = testResults.filter(r => r.status === 'warning').length
    
    if (failures > 0) {
      setOverallStatus('critical')
    } else if (warnings > 0) {
      setOverallStatus('issues')
    } else {
      setOverallStatus('good')
    }

    setIsRunning(false)
    console.log('[Test] All tests complete')
  }

  useEffect(() => {
    // Run tests on mount
    runTests()
  }, [])

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failure':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'testing':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
    }
  }

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'failure':
        return 'text-red-600'
      case 'warning':
        return 'text-orange-600'
      case 'testing':
        return 'text-blue-600'
    }
  }

  const getOverallBadge = () => {
    switch (overallStatus) {
      case 'good':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            一切正常
          </Badge>
        )
      case 'issues':
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            有警告
          </Badge>
        )
      case 'critical':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            有錯誤
          </Badge>
        )
      default:
        return null
    }
  }

  const getSuggestions = () => {
    const failures = results.filter(r => r.status === 'failure')
    const slowTests = results.filter(r => r.time && r.time > 2000)

    if (failures.length === 0 && slowTests.length === 0) return null

    return (
      <Alert className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong className="block mb-2">建議:</strong>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {failures.some(f => f.name === '配置檢查') && (
              <li>檢查環境變量是否正確設置 (參考 docs/environment-variables.md)</li>
            )}
            {failures.some(f => f.name === '網絡連接') && (
              <li>檢查網絡連接和防火牆設置</li>
            )}
            {failures.some(f => f.name === 'Session 檢查') && (
              <>
                <li>Supabase Auth 服務可能無法訪問</li>
                <li>檢查 Supabase Dashboard 的服務狀態</li>
              </>
            )}
            {failures.some(f => f.name === 'Edge Function') && (
              <li>Edge Function 可能未部署或處於錯誤狀態</li>
            )}
            {slowTests.length > 0 && (
              <>
                <li>檢測到較慢的響應時間，可能是網絡延遲或服務器冷啟動</li>
                <li>如果問題持續，考慮啟用 Edge Function 預熱</li>
              </>
            )}
          </ul>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
          <Database className="h-5 w-5" />
          Supabase 連接診斷
          <Button
            variant="outline"
            size="sm"
            onClick={runTests}
            disabled={isRunning}
            className="ml-auto"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isRunning ? 'animate-spin' : ''}`} />
            重新測試
          </Button>
        </CardTitle>
        <CardDescription className="flex items-center justify-between text-purple-700 dark:text-purple-300">
          <span>診斷 Supabase 服務連接狀態</span>
          {getOverallBadge()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {results.map((result, index) => (
          <div
            key={index}
            className="p-3 bg-white dark:bg-gray-900 rounded-lg border flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(result.status)}
              <div>
                <p className="font-medium text-sm">{result.name}</p>
                <p className={`text-xs ${getStatusColor(result.status)}`}>
                  {result.message}
                </p>
              </div>
            </div>
            {result.time !== undefined && (
              <div className="text-xs text-muted-foreground font-mono">
                {result.time.toFixed(0)}ms
              </div>
            )}
          </div>
        ))}

        {results.length === 0 && isRunning && (
          <div className="p-8 text-center text-muted-foreground">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>正在運行診斷測試...</p>
          </div>
        )}

        {getSuggestions()}

        {overallStatus === 'good' && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              所有測試通過！Supabase 連接正常。
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}