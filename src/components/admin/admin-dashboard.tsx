import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Switch } from '../ui/switch'
import { Alert, AlertDescription } from '../ui/alert'
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '../ui/pagination'
import { useIsMobile } from '../ui/use-mobile'
import { UserRoleDisplay } from './user-role-display'
import { HomepageGamesManager } from './homepage-games-manager'
import { useAuth } from '../auth/auth-provider'
import { authHelpers, type AuthUser } from '../../utils/supabase/client'
import { AuthDebugPanel } from '../utils/auth-debug-panel'
import { projectId, publicAnonKey } from '../../utils/supabase/info'
import { toast } from 'sonner@2.0.3'
import { 
  Shield, 
  Users, 
  Settings, 
  LogOut, 
  UserCheck, 
  MessageSquare,
  BarChart3,
  Database,
  Plus,
  Edit2,
  Trash2,
  Gamepad2,
  DollarSign,
  AlertCircle,
  Save,
  X,
  ShoppingCart,
  CheckCircle,
  Clock,
  Package,
  Eye,
  XCircle,
  AlertTriangle,
  Search,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Menu,
  Sparkles
} from 'lucide-react'

interface AdminDashboardProps {
  onLogout: () => void
}

// Types for CMS entities
interface Region {
  id: string
  name: string
  code: string
  i18n?: Record<string, any>
  created_at: string
  updated_at?: string
}

interface Platform {
  id: string
  name: string
  code: string
  i18n?: Record<string, any>
  created_at: string
  updated_at?: string
}

interface DisplayTag {
  id: string
  name: string
  color: string
  i18n?: Record<string, any>
  created_at: string
  updated_at?: string
}

interface Game {
  id: string
  name: string
  region_code: string
  description?: string
  is_archived?: boolean
  created_at: string
  updated_at?: string
}

interface Denomination {
  id: string
  game_id: string
  platform_id: string
  display_tag_id?: string
  name: string
  display_price: number
  cost_price: number
  sku_code?: string
  is_available?: boolean
  is_archived?: boolean
  description?: string
  created_at: string
  updated_at?: string
}

interface Order {
  id: string
  customer_email: string
  game_login_username: string
  quantity: number
  total_price: number
  status: string
  payment_status: string
  fulfillment_status: string
  created_at: string
  paid_at?: string
  fulfilled_at?: string
  fulfillment_notes?: string
  denominations?: {
    name: string
    display_price: number
  }
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const isMobile = useIsMobile()
  const { user, userRole, isAuthenticated } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('orders')

  // CMS Data State
  const [regions, setRegions] = useState<Region[]>([])
  const [platforms, setPlatforms] = useState<Platform[]>([])
  const [displayTags, setDisplayTags] = useState<DisplayTag[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [denominations, setDenominations] = useState<Denomination[]>([])
  const [homepageGames, setHomepageGames] = useState<any[]>([])
  
  // Orders Management State
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [fulfillmentDialogOpen, setFulfillmentDialogOpen] = useState(false)
  const [fulfillmentNotes, setFulfillmentNotes] = useState('')
  const [fulfilling, setFulfilling] = useState(false)
  
  // Payment Management State
  const [payments, setPayments] = useState<any[]>([])
  const [orderStats, setOrderStats] = useState<any>(null)
  const [paymentLoading, setPaymentLoading] = useState(false)

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [dialogType, setDialogType] = useState<'region' | 'platform' | 'displayTag' | 'game' | 'denomination' | 'homepageGame'>('region')
  
  // Homepage games state
  const [homepageGamesLoading, setHomepageGamesLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Form states
  const [formData, setFormData] = useState<any>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Pagination states
  const [ordersCurrentPage, setOrdersCurrentPage] = useState(1)
  const [denominationsCurrentPage, setDenominationsCurrentPage] = useState(1)
  const [gamesCurrentPage, setGamesCurrentPage] = useState(1)
  const [homepageGamesCurrentPage, setHomepageGamesCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  // Search states
  const [ordersSearchQuery, setOrdersSearchQuery] = useState('')
  const [gamesSearchQuery, setGamesSearchQuery] = useState('')
  const [denominationsSearchQuery, setDenominationsSearchQuery] = useState('')
  const [homepageGamesSearchQuery, setHomepageGamesSearchQuery] = useState('')

  // Sort states
  const [ordersSortBy, setOrdersSortBy] = useState<string>('created_at')
  const [ordersSortOrder, setOrdersSortOrder] = useState<'asc' | 'desc'>('desc')
  const [gamesSortBy, setGamesSortBy] = useState<string>('created_at')
  const [gamesSortOrder, setGamesSortOrder] = useState<'asc' | 'desc'>('desc')
  const [denominationsSortBy, setDenominationsSortBy] = useState<string>('created_at')
  const [denominationsSortOrder, setDenominationsSortOrder] = useState<'asc' | 'desc'>('desc')
  const [homepageGamesSortBy, setHomepageGamesSortBy] = useState<string>('order')
  const [homepageGamesSortOrder, setHomepageGamesSortOrder] = useState<'asc' | 'desc'>('asc')

  // Load CMS data when component mounts and user is admin
  useEffect(() => {
    const loadInitialData = async () => {
      console.log('[AdminDashboard] Starting initialization...', 'userRole:', userRole, 'isAuthenticated:', isAuthenticated)
      
      if (userRole === 'admin' && isAuthenticated) {
        console.log('[AdminDashboard] Loading CMS data for admin...')
        try {
          await loadCMSData()
          console.log('[AdminDashboard] CMS data loaded successfully')
        } catch (error) {
          console.error('[AdminDashboard] Failed to load CMS data:', error)
          toast.error('載入資料失敗')
        }
      } else {
        console.log('[AdminDashboard] Skipping CMS data load - role:', userRole)
      }
      
      setIsLoading(false)
    }

    // Only load when we have auth info
    if (userRole) {
      loadInitialData()
    }
  }, []) // Only run once on mount - userRole should be available from Router's auth check

  // Auto-load orders when switching to orders tab
  useEffect(() => {
    if (activeTab === 'orders' && userRole === 'admin') {
      loadOrders()
    }
  }, [activeTab, userRole])

  // Auto-load homepage games when switching to homepage-games tab
  useEffect(() => {
    if (activeTab === 'homepage-games' && userRole === 'admin') {
      loadHomepageGames()
    }
  }, [activeTab, userRole])

  const loadCMSData = async () => {
    try {
      // Add explicit loading state update
      setIsLoading(true)
      console.log('[AdminDashboard] Starting CMS data load...')
      
      const { session, error: sessionError } = await authHelpers.getSession()
      
      if (sessionError || !session?.access_token) {
        console.error('[AdminDashboard] Session error:', sessionError)
        toast.error('會話驗證失敗，請重新登入')
        setIsLoading(false)
        return
      }
      
      console.log('[AdminDashboard] Session validated, fetching CMS data...')
      
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-04b375d8/cms`
      
      const headers = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }

      const fetchOptions = {
        headers,
        signal: AbortSignal.timeout(15000) // 15 second timeout
      }

      // Load all CMS data in parallel with timeout
      console.log('[AdminDashboard] Fetching all CMS endpoints in parallel...')
      const [regionsRes, platformsRes, displayTagsRes, gamesRes, denominationsRes] = await Promise.all([
        fetch(`${baseUrl}/regions`, fetchOptions),
        fetch(`${baseUrl}/platforms`, fetchOptions),
        fetch(`${baseUrl}/display-tags`, fetchOptions),
        fetch(`${baseUrl}/games`, fetchOptions),
        fetch(`${baseUrl}/denominations`, fetchOptions)
      ])

      // Process responses with error handling
      let successCount = 0
      let failCount = 0

      if (regionsRes.ok) {
        const data = await regionsRes.json()
        setRegions(data.regions || [])
        console.log('[AdminDashboard] ✓ Regions loaded:', data.regions?.length || 0)
        successCount++
      } else {
        console.error('[AdminDashboard] ✗ Failed to load regions:', regionsRes.status)
        failCount++
      }

      if (platformsRes.ok) {
        const data = await platformsRes.json()
        setPlatforms(data.platforms || [])
        console.log('[AdminDashboard] ✓ Platforms loaded:', data.platforms?.length || 0)
        successCount++
      } else {
        console.error('[AdminDashboard] ✗ Failed to load platforms:', platformsRes.status)
        failCount++
      }

      if (displayTagsRes.ok) {
        const data = await displayTagsRes.json()
        setDisplayTags(data.displayTags || [])
        console.log('[AdminDashboard] ✓ Display tags loaded:', data.displayTags?.length || 0)
        successCount++
      } else {
        console.error('[AdminDashboard] ✗ Failed to load display tags:', displayTagsRes.status)
        failCount++
      }

      if (gamesRes.ok) {
        const data = await gamesRes.json()
        setGames(data.games || [])
        console.log('[AdminDashboard] ✓ Games loaded:', data.games?.length || 0)
        successCount++
      } else {
        console.error('[AdminDashboard] ✗ Failed to load games:', gamesRes.status)
        failCount++
      }

      if (denominationsRes.ok) {
        const data = await denominationsRes.json()
        setDenominations(data.denominations || [])
        console.log('[AdminDashboard] ✓ Denominations loaded:', data.denominations?.length || 0)
        successCount++
      } else {
        console.error('[AdminDashboard] ✗ Failed to load denominations:', denominationsRes.status)
        failCount++
      }

      console.log(`[AdminDashboard] CMS data load complete: ${successCount} succeeded, ${failCount} failed`)
      
      // Show appropriate notification
      if (failCount > 0 && successCount > 0) {
        toast.warning(`部分資料載入失敗 (${failCount}/${successCount + failCount})`)
      } else if (failCount > 0) {
        toast.error('載入 CMS 資料失敗，請刷新頁面重試')
      } else {
        console.log('[AdminDashboard] ✓ All CMS data loaded successfully')
      }

    } catch (error) {
      console.error('[AdminDashboard] ❌ Failed to load CMS data:', error)
      if (error instanceof Error && error.name === 'TimeoutError') {
        toast.error('載入資料超時，請檢查網路連線')
      } else if (error instanceof Error && error.name === 'AbortError') {
        toast.error('載入資料已取消')
      } else {
        toast.error('加載數據失敗，請刷新頁面重試')
      }
    } finally {
      setIsLoading(false)
      console.log('[AdminDashboard] Loading state cleared')
    }
  }

  const loadPaymentData = async () => {
    try {
      setPaymentLoading(true)
      const { access_token, error: sessionError } = await authHelpers.getSession()
      
      if (sessionError || !access_token) {
        console.error('Session error during payment data load:', sessionError)
        toast.error('會話已過期，請重新登入')
        return
      }
      
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-04b375d8/admin`
      
      const headers = {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }

      const fetchOptions = {
        headers,
        signal: AbortSignal.timeout(15000)
      }

      // Load payment data and order stats in parallel
      const [paymentsRes, statsRes] = await Promise.all([
        fetch(`${baseUrl}/payments`, fetchOptions),
        fetch(`${baseUrl}/order-stats`, fetchOptions)
      ])

      if (paymentsRes.ok) {
        const data = await paymentsRes.json()
        setPayments(data.payments || [])
      }

      if (statsRes.ok) {
        const data = await statsRes.json()
        setOrderStats(data.stats || null)
      }

    } catch (error) {
      console.error('Failed to load payment data:', error)
      if (error instanceof Error && error.name === 'TimeoutError') {
        toast.error('載入支付資料超時，請檢查網路連線')
      } else {
        toast.error('載入支付資料失敗')
      }
    } finally {
      setPaymentLoading(false)
    }
  }

  const loadOrders = async (fulfillmentStatus?: string) => {
    try {
      setOrdersLoading(true)
      const { access_token, error: sessionError } = await authHelpers.getSession()
      
      if (sessionError || !access_token) {
        console.error('Session error during orders load:', sessionError)
        toast.error('會話已過期，請重新登入')
        return
      }
      
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-04b375d8/admin`
      
      const headers = {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }

      let url = `${baseUrl}/orders?limit=100`
      if (fulfillmentStatus) {
        url += `&fulfillment_status=${fulfillmentStatus}`
      }

      const response = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(15000)
      })

      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else {
        toast.error('載入訂單資料失敗')
      }

    } catch (error) {
      console.error('Failed to load orders:', error)
      if (error instanceof Error && error.name === 'TimeoutError') {
        toast.error('載入訂單資料超時，請檢查網路連線')
      } else {
        toast.error('載入訂單資料失敗')
      }
    } finally {
      setOrdersLoading(false)
    }
  }

  const loadHomepageGames = async () => {
    try {
      setHomepageGamesLoading(true)
      
      // Public endpoint - no auth required
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-04b375d8`
      
      const response = await fetch(`${baseUrl}/games`, {
        signal: AbortSignal.timeout(15000)
      })

      if (response.ok) {
        const data = await response.json()
        setHomepageGames(data.games || [])
      } else {
        toast.error('載入首頁游戲失敗')
      }

    } catch (error) {
      console.error('Failed to load homepage games:', error)
      if (error instanceof Error && error.name === 'TimeoutError') {
        toast.error('載入首頁游戲超時，請檢查網路連線')
      } else {
        toast.error('載入首頁游戲失敗')
      }
    } finally {
      setHomepageGamesLoading(false)
    }
  }

  const handleFulfillOrder = async () => {
    if (!selectedOrder) return

    try {
      setFulfilling(true)
      const { access_token, error: sessionError } = await authHelpers.getSession()
      
      if (sessionError || !access_token) {
        toast.error('會話已過期，請重新登入')
        return
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-04b375d8/orders/${selectedOrder.id}/fulfill`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fulfillment_notes: fulfillmentNotes
          }),
          signal: AbortSignal.timeout(15000)
        }
      )

      if (response.ok) {
        const data = await response.json()
        toast.success('訂單履行成功！')
        setFulfillmentDialogOpen(false)
        setFulfillmentNotes('')
        setSelectedOrder(null)
        // Reload orders
        await loadOrders()
      } else {
        const error = await response.json()
        toast.error(error.error || '訂單履行失敗')
      }
    } catch (error) {
      console.error('Fulfill order error:', error)
      if (error instanceof Error && error.name === 'TimeoutError') {
        toast.error('請求超時，請檢查網路連線')
      } else {
        toast.error('訂單履行時發生錯誤')
      }
    } finally {
      setFulfilling(false)
    }
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      setUploadingImage(true)
      const { access_token, error: sessionError } = await authHelpers.getSession()
      
      if (sessionError || !access_token) {
        toast.error('會話已過期，請重新登入')
        throw new Error('Authentication required')
      }

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-04b375d8/games/upload-cover`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${access_token}`
          },
          body: formData,
          signal: AbortSignal.timeout(30000) // 30 second timeout for file upload
        }
      )

      if (response.ok) {
        const data = await response.json()
        toast.success('圖片上傳成功！')
        return data.url
      } else {
        const error = await response.json()
        toast.error(error.error || '圖片上傳失敗')
        throw new Error(error.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Image upload error:', error)
      if (error instanceof Error && error.name === 'TimeoutError') {
        toast.error('圖片上傳超時，請檢查網路連線')
      } else if (error instanceof Error && error.message !== 'Authentication required') {
        toast.error('圖片上傳時發生錯誤')
      }
      throw error
    } finally {
      setUploadingImage(false)
    }
  }

  const handleHomepageGameSave = async () => {
    if (!validateForm()) return

    try {
      const { access_token, error: sessionError } = await authHelpers.getSession()
      
      if (sessionError || !access_token) {
        console.error('Session error during save:', sessionError)
        toast.error('會話已過期，請重新登入')
        return
      }
      
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-04b375d8`
      
      const headers = {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }

      const endpoint = editingItem 
        ? `${baseUrl}/games/${editingItem.id}`
        : `${baseUrl}/games`
      const method = editingItem ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers,
        body: JSON.stringify(formData),
        signal: AbortSignal.timeout(10000)
      })

      if (response.ok) {
        toast.success(editingItem ? '更新成功' : '新增成功')
        closeDialog()
        await loadHomepageGames()
      } else {
        const error = await response.json()
        toast.error(error.error || '操作失敗')
      }
    } catch (error) {
      console.error('Save homepage game error:', error)
      if (error instanceof Error && error.name === 'TimeoutError') {
        toast.error('請求超時，請檢查網路連線')
      } else {
        toast.error('保存時發生錯誤')
      }
    }
  }

  const handleHomepageGameDelete = async (id: string) => {
    if (!confirm('確定要刪除此首頁游戲嗎？此操作無法撤銷。')) return

    try {
      const { access_token, error: sessionError } = await authHelpers.getSession()
      
      if (sessionError || !access_token) {
        console.error('Session error during delete:', sessionError)
        toast.error('會話已過期，請重新登入')
        return
      }
      
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-04b375d8`
      
      const headers = {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }

      const response = await fetch(`${baseUrl}/games/${id}`, {
        method: 'DELETE',
        headers,
        signal: AbortSignal.timeout(10000)
      })

      if (response.ok) {
        toast.success('刪除成功')
        await loadHomepageGames()
      } else {
        const error = await response.json()
        toast.error(error.error || '刪除失敗')
      }
    } catch (error) {
      console.error('Delete homepage game error:', error)
      if (error instanceof Error && error.name === 'TimeoutError') {
        toast.error('請求超時，請檢查網路連線')
      } else {
        toast.error('刪除時發生錯誤')
      }
    }
  }

  const openFulfillmentDialog = (order: Order) => {
    setSelectedOrder(order)
    setFulfillmentNotes('')
    setFulfillmentDialogOpen(true)
  }

  const handleLogout = async () => {
    try {
      await authHelpers.signOut()
      toast.success('已成功登出')
      onLogout()
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('登出時發生錯誤')
    }
  }

  const openCreateDialog = (type: typeof dialogType) => {
    setDialogType(type)
    setEditingItem(null)
    setFormData({})
    setFormErrors({})
    setIsDialogOpen(true)
  }

  const openEditDialog = (type: typeof dialogType, item: any) => {
    setDialogType(type)
    setEditingItem(item)
    setFormData({ ...item })
    setFormErrors({})
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setEditingItem(null)
    setFormData({})
    setFormErrors({})
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    switch (dialogType) {
      case 'region':
      case 'platform':
        if (!formData.name?.trim()) errors.name = '名稱為必填項目'
        if (!formData.code?.trim()) errors.code = '代碼為必填項目'
        break
      case 'displayTag':
        if (!formData.name?.trim()) errors.name = '名稱為必填項目'
        break
      case 'game':
        if (!formData.name?.trim()) errors.name = '名稱為必填項目'
        if (!formData.region_code?.trim()) errors.region_code = '請選擇區域代碼'
        break
      case 'denomination':
        if (!formData.name?.trim()) errors.name = '名稱為必填項目'
        if (!formData.game_id) errors.game_id = '請選擇遊戲'
        if (!formData.platform_id) errors.platform_id = '請選擇平台'
        if (formData.display_price === undefined || formData.display_price === '' || isNaN(Number(formData.display_price)) || Number(formData.display_price) < 0) {
          errors.display_price = '請輸入有效的價格（美元）'
        }
        if (formData.cost_price === undefined || formData.cost_price === '' || isNaN(Number(formData.cost_price)) || Number(formData.cost_price) < 0) {
          errors.cost_price = '請輸入有效的成本'
        }
        break
      case 'homepageGame':
        if (!formData.name?.trim()) errors.name = '游戲名稱為必填項目'
        if (!formData.coverUrl?.trim()) errors.coverUrl = '封面圖片為必填項目'
        if (!formData.price?.trim()) errors.price = '價格顯示為必填項目'
        if (formData.order === undefined || formData.order === '' || isNaN(Number(formData.order)) || Number(formData.order) < 0) {
          errors.order = '請輸入有效的排序數字'
        }
        break
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      const { access_token, error: sessionError } = await authHelpers.getSession()
      
      if (sessionError || !access_token) {
        console.error('Session error during save:', sessionError)
        toast.error('會話已過期，請重新登入')
        return
      }
      
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-04b375d8/cms`
      
      const headers = {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }

      let endpoint = ''
      let method = editingItem ? 'PUT' : 'POST'

      switch (dialogType) {
        case 'region':
          endpoint = editingItem ? `${baseUrl}/regions/${editingItem.id}` : `${baseUrl}/regions`
          break
        case 'platform':
          endpoint = editingItem ? `${baseUrl}/platforms/${editingItem.id}` : `${baseUrl}/platforms`
          break
        case 'displayTag':
          endpoint = editingItem ? `${baseUrl}/display-tags/${editingItem.id}` : `${baseUrl}/display-tags`
          break
        case 'game':
          endpoint = editingItem ? `${baseUrl}/games/${editingItem.id}` : `${baseUrl}/games`
          break
        case 'denomination':
          endpoint = editingItem ? `${baseUrl}/denominations/${editingItem.id}` : `${baseUrl}/denominations`
          break
      }

      const response = await fetch(endpoint, {
        method,
        headers,
        body: JSON.stringify(formData),
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      if (response.ok) {
        toast.success(editingItem ? '更���成功' : '新增成功')
        closeDialog()
        await loadCMSData()
      } else {
        const error = await response.json()
        toast.error(error.error || '操作失敗')
      }
    } catch (error) {
      console.error('Save error:', error)
      if (error instanceof Error && error.name === 'TimeoutError') {
        toast.error('請求超時，請檢查網路連線')
      } else if (error instanceof Error && error.name === 'AbortError') {
        toast.error('請求已取消')
      } else {
        toast.error('保存時發生錯誤')
      }
    }
  }

  const handleDelete = async (type: typeof dialogType, id: string) => {
    if (!confirm('確定要刪除此項目嗎？此操作無法撤銷。')) return

    try {
      const { access_token, error: sessionError } = await authHelpers.getSession()
      
      if (sessionError || !access_token) {
        console.error('Session error during delete:', sessionError)
        toast.error('會話已過期，請重新登入')
        return
      }
      
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-04b375d8/cms`
      
      const headers = {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }

      let endpoint = ''
      switch (type) {
        case 'region':
          endpoint = `${baseUrl}/regions/${id}`
          break
        case 'platform':
          endpoint = `${baseUrl}/platforms/${id}`
          break
        case 'displayTag':
          endpoint = `${baseUrl}/display-tags/${id}`
          break
        case 'game':
          endpoint = `${baseUrl}/games/${id}`
          break
        case 'denomination':
          endpoint = `${baseUrl}/denominations/${id}`
          break
      }

      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers,
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      if (response.ok) {
        toast.success('刪除成功')
        await loadCMSData()
      } else {
        const error = await response.json()
        toast.error(error.error || '刪除失敗')
      }
    } catch (error) {
      console.error('Delete error:', error)
      if (error instanceof Error && error.name === 'TimeoutError') {
        toast.error('請求超時，請檢查網路連線')
      } else if (error instanceof Error && error.name === 'AbortError') {
        toast.error('請求已取消')
      } else {
        toast.error('刪除時發生錯誤')
      }
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'cs':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return '系統管理員'
      case 'cs':
        return '客服人員'
      default:
        return '一般用戶'
    }
  }

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  }

  const getRegionName = (regionCode: string) => {
    const region = regions.find(r => r.code === regionCode)
    return region?.name || regionCode
  }

  const getGameName = (gameId: string) => {
    const game = games.find(g => g.id === gameId)
    return game?.name || gameId
  }

  const getPlatformName = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId)
    return platform?.name || platformId
  }

  const getDisplayTagName = (displayTagId?: string) => {
    if (!displayTagId) return '-'
    const displayTag = displayTags.find(dt => dt.id === displayTagId)
    return displayTag?.name || displayTagId
  }

  // Search filter functions
  const filterOrders = (orders: Order[], query: string): Order[] => {
    if (!query.trim()) return orders
    const lowerQuery = query.toLowerCase()
    return orders.filter(order => 
      order.customer_email?.toLowerCase().includes(lowerQuery) ||
      order.game_login_username?.toLowerCase().includes(lowerQuery) ||
      order.id?.toLowerCase().includes(lowerQuery) ||
      order.denominations?.name?.toLowerCase().includes(lowerQuery)
    )
  }

  const filterGames = (games: Game[], query: string): Game[] => {
    if (!query.trim()) return games
    const lowerQuery = query.toLowerCase()
    return games.filter(game => 
      game.name?.toLowerCase().includes(lowerQuery) ||
      game.code?.toLowerCase().includes(lowerQuery) ||
      game.description?.toLowerCase().includes(lowerQuery)
    )
  }

  const filterDenominations = (denominations: Denomination[], query: string): Denomination[] => {
    if (!query.trim()) return denominations
    const lowerQuery = query.toLowerCase()
    return denominations.filter(denom => {
      const gameName = getGameName(denom.game_id).toLowerCase()
      const platformName = getPlatformName(denom.platform_id).toLowerCase()
      return (
        denom.name?.toLowerCase().includes(lowerQuery) ||
        denom.sku_code?.toLowerCase().includes(lowerQuery) ||
        gameName.includes(lowerQuery) ||
        platformName.includes(lowerQuery)
      )
    })
  }

  const filterHomepageGames = (games: any[], query: string): any[] => {
    if (!query.trim()) return games
    const lowerQuery = query.toLowerCase()
    return games.filter(game => 
      game.name?.toLowerCase().includes(lowerQuery) ||
      game.badge?.toLowerCase().includes(lowerQuery)
    )
  }

  // Sort functions
  const sortData = <T extends Record<string, any>>(
    data: T[], 
    sortBy: string, 
    sortOrder: 'asc' | 'desc'
  ): T[] => {
    return [...data].sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      // Handle nested objects (like denominations.name)
      if (sortBy.includes('.')) {
        const keys = sortBy.split('.')
        aValue = keys.reduce((obj, key) => obj?.[key], a)
        bValue = keys.reduce((obj, key) => obj?.[key], b)
      }

      // Handle null/undefined
      if (aValue == null) return 1
      if (bValue == null) return -1

      // Handle different types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }

      // Handle dates
      if (aValue instanceof Date || bValue instanceof Date || 
          (typeof aValue === 'string' && !isNaN(Date.parse(aValue)))) {
        const dateA = new Date(aValue).getTime()
        const dateB = new Date(bValue).getTime()
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
      }

      return 0
    })
  }

  const handleSort = (
    currentSortBy: string,
    currentSortOrder: 'asc' | 'desc',
    newSortBy: string,
    setSortBy: (value: string) => void,
    setSortOrder: (value: 'asc' | 'desc') => void
  ) => {
    if (currentSortBy === newSortBy) {
      // Toggle order
      setSortOrder(currentSortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // New column, default to descending
      setSortBy(newSortBy)
      setSortOrder('desc')
    }
  }

  const renderSortIcon = (columnName: string, currentSortBy: string, currentSortOrder: 'asc' | 'desc') => {
    if (currentSortBy !== columnName) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-40" />
    }
    return currentSortOrder === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />
  }

  // CSV Export functions
  const escapeCSV = (value: any): string => {
    if (value == null) return ''
    const stringValue = String(value)
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }
    return stringValue
  }

  const exportToCSV = (data: any[], filename: string, headers: { key: string; label: string }[]) => {
    // Create CSV header row
    const headerRow = headers.map(h => escapeCSV(h.label)).join(',')
    
    // Create data rows
    const dataRows = data.map(row => {
      return headers.map(header => {
        let value = row[header.key]
        
        // Handle nested properties
        if (header.key.includes('.')) {
          const keys = header.key.split('.')
          value = keys.reduce((obj, key) => obj?.[key], row)
        }
        
        // Format dates
        if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)) && header.key.includes('_at'))) {
          value = new Date(value).toLocaleString('zh-TW')
        }
        
        return escapeCSV(value)
      }).join(',')
    })

    // Combine header and data
    const csv = [headerRow, ...dataRows].join('\n')
    
    // Create blob and download
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' }) // UTF-8 BOM for Excel
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success(`已導出 ${data.length} 條記錄到 CSV 文件`)
  }

  const exportOrders = () => {
    const filteredOrders = filterOrders(orders, ordersSearchQuery)
    const headers = [
      { key: 'id', label: '訂單 ID' },
      { key: 'customer_email', label: '客戶信箱' },
      { key: 'game_login_username', label: '遊戲帳號' },
      { key: 'denominations.name', label: '產品' },
      { key: 'quantity', label: '數量' },
      { key: 'total_price', label: '總價 (USD)' },
      { key: 'payment_status', label: '支付狀態' },
      { key: 'fulfillment_status', label: '履行狀態' },
      { key: 'created_at', label: '創建時間' },
      { key: 'paid_at', label: '支付時間' },
      { key: 'fulfilled_at', label: '履行時間' },
      { key: 'fulfillment_notes', label: '履行備註' }
    ]
    exportToCSV(filteredOrders, 'orders', headers)
  }

  const exportGames = () => {
    const filteredGames = filterGames(games, gamesSearchQuery)
    const headers = [
      { key: 'id', label: '遊戲 ID' },
      { key: 'name', label: '遊戲名稱' },
      { key: 'code', label: '代碼' },
      { key: 'region_code', label: '區域代碼' },
      { key: 'description', label: '描述' },
      { key: 'is_archived', label: '已歸檔' },
      { key: 'created_at', label: '創建時間' },
      { key: 'updated_at', label: '更新時間' }
    ]
    exportToCSV(filteredGames, 'games', headers)
  }

  const exportDenominations = () => {
    const filteredDenominations = filterDenominations(denominations, denominationsSearchQuery)
    // Enhance data with related names
    const enhancedData = filteredDenominations.map(denom => ({
      ...denom,
      game_name: getGameName(denom.game_id),
      platform_name: getPlatformName(denom.platform_id),
      display_tag_name: getDisplayTagName(denom.display_tag_id)
    }))
    
    const headers = [
      { key: 'id', label: '產品 ID' },
      { key: 'name', label: '面額名稱' },
      { key: 'game_name', label: '遊戲' },
      { key: 'platform_name', label: '平台' },
      { key: 'display_tag_name', label: '促銷標籤' },
      { key: 'display_price', label: '價格 (USD)' },
      { key: 'cost_price', label: '成本' },
      { key: 'sku_code', label: 'SKU 代碼' },
      { key: 'is_available', label: '可購買' },
      { key: 'is_archived', label: '已歸檔' },
      { key: 'description', label: '描述' },
      { key: 'created_at', label: '創建時間' },
      { key: 'updated_at', label: '更新時間' }
    ]
    exportToCSV(enhancedData, 'denominations', headers)
  }

  const exportHomepageGames = () => {
    const filteredGames = filterHomepageGames(homepageGames, homepageGamesSearchQuery)
    const headers = [
      { key: 'id', label: '游戲 ID' },
      { key: 'name', label: '游戲名稱' },
      { key: 'price', label: '價格顯示' },
      { key: 'badge', label: '標籤' },
      { key: 'discount', label: '折扣' },
      { key: 'order', label: '排序' },
      { key: 'coverUrl', label: '封面圖片 URL' },
      { key: 'createdAt', label: '創建時間' },
      { key: 'updatedAt', label: '更新時間' }
    ]
    exportToCSV(filteredGames, 'homepage-games', headers)
  }

  const getFulfillmentStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            已完成
          </Badge>
        )
      case 'processing':
        return (
          <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
            <Clock className="h-3 w-3 mr-1" />
            處理中
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
            <Package className="h-3 w-3 mr-1" />
            待處理
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            失敗
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge variant="outline" className="border-slate-300 text-slate-600">
            <X className="h-3 w-3 mr-1" />
            已取消
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Pagination helper functions
  const paginateData = <T,>(data: T[], page: number): T[] => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return data.slice(startIndex, endIndex)
  }

  const getTotalPages = (totalItems: number): number => {
    return Math.ceil(totalItems / ITEMS_PER_PAGE)
  }

  const renderPagination = (
    currentPage: number, 
    totalItems: number, 
    onPageChange: (page: number) => void
  ) => {
    const totalPages = getTotalPages(totalItems)
    
    if (totalPages <= 1) return null

    return (
      <div className="flex justify-center mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first page, last page, current page, and pages around current
              if (
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => onPageChange(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                )
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <PaginationItem key={page}>
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              }
              return null
            })}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    )
  }

  console.log('[AdminDashboard] Render - isLoading:', isLoading, 'userRole:', userRole, 'user:', user?.email)
  
  // Show loading only for CMS data, not for the entire dashboard
  // Router already handles auth checks, so we can show the dashboard immediately
  console.log('[AdminDashboard] Rendering main dashboard')
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 md:py-4">
            <div className="flex items-center gap-2 md:gap-3">
              {/* Mobile Menu Button */}
              {isMobile && (
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="md:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[280px] sm:w-[350px]">
                    <SheetHeader>
                      <SheetTitle>導航選單</SheetTitle>
                    </SheetHeader>
                    <nav className="flex flex-col gap-2 mt-6">
                      <Button
                        variant={activeTab === 'orders' ? 'default' : 'ghost'}
                        className="justify-start"
                        onClick={() => { setActiveTab('orders'); setMobileMenuOpen(false) }}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        訂單管理
                      </Button>
                      <Button
                        variant={activeTab === 'games' ? 'default' : 'ghost'}
                        className="justify-start"
                        onClick={() => { setActiveTab('games'); setMobileMenuOpen(false) }}
                      >
                        <Gamepad2 className="h-4 w-4 mr-2" />
                        遊戲管理
                      </Button>
                      <Button
                        variant={activeTab === 'homepage-games' ? 'default' : 'ghost'}
                        className="justify-start"
                        onClick={() => { setActiveTab('homepage-games'); setMobileMenuOpen(false) }}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        首頁游戲管理
                      </Button>
                      <Button
                        variant={activeTab === 'denominations' ? 'default' : 'ghost'}
                        className="justify-start"
                        onClick={() => { setActiveTab('denominations'); setMobileMenuOpen(false) }}
                      >
                        <DollarSign className="h-4 w-4 mr-2" />
                        產品面額管理
                      </Button>
                      <Button
                        variant={activeTab === 'payments' ? 'default' : 'ghost'}
                        className="justify-start"
                        onClick={() => { setActiveTab('payments'); setMobileMenuOpen(false) }}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        支付管理
                      </Button>
                      <Button
                        variant={activeTab === 'settings' ? 'default' : 'ghost'}
                        className="justify-start"
                        onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false) }}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        基礎設定管理
                      </Button>
                      <Button
                        variant={activeTab === 'rls-test' ? 'default' : 'ghost'}
                        className="justify-start"
                        onClick={() => { setActiveTab('rls-test'); setMobileMenuOpen(false) }}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        RLS 測試
                      </Button>
                    </nav>
                  </SheetContent>
                </Sheet>
              )}
              
              <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                <Shield className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-base md:text-xl">CMS 管理面板</h1>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">內容管理系統</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <Avatar className="h-7 w-7 md:h-8 md:w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {getInitials(user?.user_metadata?.full_name || user?.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-sm hidden md:block">
                  <p className="font-medium text-sm">{user?.user_metadata?.full_name || user?.email}</p>
                  <Badge className={getRoleColor(userRole)} variant="outline">
                    {getRoleLabel(userRole)}
                  </Badge>
                </div>
              </div>
              
              <Button variant="outline" size="sm" onClick={handleLogout} className="px-2 md:px-4">
                <LogOut className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">登出</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8">
        {/* Loading Overlay for CMS Data */}
        {isLoading && (
          <Alert className="mb-4 md:mb-6">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <AlertDescription>正在載入管理數據...</AlertDescription>
            </div>
          </Alert>
        )}
        
        {/* Role Display Component */}
        <div className="mb-4 md:mb-6">
          <UserRoleDisplay showDetails={true} showRefresh={true} />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Desktop Tabs - Hidden on Mobile */}
          <TabsList className="hidden md:grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              訂單管理
            </TabsTrigger>
            <TabsTrigger value="games" className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              遊戲管理
            </TabsTrigger>
            <TabsTrigger value="homepage-games" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              首頁游戲
            </TabsTrigger>
            <TabsTrigger value="denominations" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              產品面額管理
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              支付管理
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              基礎設定管理
            </TabsTrigger>
            <TabsTrigger value="rls-test" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              RLS 測試
            </TabsTrigger>
          </TabsList>
          
          {/* Mobile: Current Tab Indicator */}
          <div className="md:hidden mb-4 p-3 bg-white rounded-lg border shadow-sm">
            <p className="text-xs text-muted-foreground mb-1">當前頁面</p>
            <div className="flex items-center gap-2">
              {activeTab === 'orders' && <><ShoppingCart className="h-4 w-4" /><span>訂單管理</span></>}
              {activeTab === 'games' && <><Gamepad2 className="h-4 w-4" /><span>遊戲管理</span></>}
              {activeTab === 'homepage-games' && <><Sparkles className="h-4 w-4" /><span>首頁游戲管理</span></>}
              {activeTab === 'denominations' && <><DollarSign className="h-4 w-4" /><span>產品面額管理</span></>}
              {activeTab === 'payments' && <><BarChart3 className="h-4 w-4" /><span>支付管理</span></>}
              {activeTab === 'settings' && <><Settings className="h-4 w-4" /><span>基礎設定管理</span></>}
              {activeTab === 'rls-test' && <><Shield className="h-4 w-4" /><span>RLS 測試</span></>}
            </div>
          </div>

          {/* Orders Management Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <CardTitle>訂單管理</CardTitle>
                    <CardDescription>查看和處理客戶訂單</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={() => loadOrders()} className="w-full sm:w-auto">
                      重新載入
                    </Button>
                    <Button variant="outline" onClick={() => loadOrders('processing')} className="w-full sm:w-auto">
                      <Clock className="h-4 w-4 mr-2" />
                      待履行訂單
                    </Button>
                    <Button variant="outline" onClick={exportOrders} className="w-full sm:w-auto">
                      <Download className="h-4 w-4 mr-2" />
                      導出 CSV
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索訂單 ID、客戶信箱、遊戲帳號或產品名稱..."
                    value={ordersSearchQuery}
                    onChange={(e) => {
                      setOrdersSearchQuery(e.target.value)
                      setOrdersCurrentPage(1) // Reset to first page on search
                    }}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground">載入訂單中...</p>
                  </div>
                ) : (
                  <>
                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-3">
                    {paginateData(
                      sortData(filterOrders(orders, ordersSearchQuery), ordersSortBy, ordersSortOrder), 
                      ordersCurrentPage
                    ).map((order) => (
                      <Card key={order.id} className="overflow-hidden">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground mb-1">訂單 ID</p>
                              <p className="font-mono text-xs truncate">{order.id}</p>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              {order.fulfillment_status === 'processing' && 
                               order.payment_status === 'paid' && (
                                <Button
                                  size="sm"
                                  onClick={() => openFulfillmentDialog(order)}
                                  className="bg-green-600 hover:bg-green-700 h-8"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  履行
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedOrder(order)}
                                className="h-8"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-xs text-muted-foreground mb-0.5">客戶信箱</p>
                              <p className="truncate">{order.customer_email}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-0.5">產品</p>
                              <p className="truncate">{order.denominations?.name || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-0.5">數量</p>
                              <p>{order.quantity}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-0.5">總價</p>
                              <p className="font-medium">${order.total_price.toFixed(2)}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 flex-wrap">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">支付狀態</p>
                              {order.payment_status === 'paid' ? (
                                <Badge variant="default" className="bg-green-500">已支付</Badge>
                              ) : order.payment_status === 'pending' ? (
                                <Badge variant="secondary">待支付</Badge>
                              ) : (
                                <Badge variant="destructive">失敗</Badge>
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">履行狀態</p>
                              {getFulfillmentStatusBadge(order.fulfillment_status)}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">創建時間</p>
                            <p className="text-xs">
                              {new Date(order.created_at).toLocaleDateString('zh-TW', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {filterOrders(orders, ordersSearchQuery).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        {ordersSearchQuery ? '沒有符合搜索條件的訂單' : '暫無訂單資料'}
                      </div>
                    )}
                  </div>
                  
                  {/* Desktop Table View */}
                  <Table className="hidden md:table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>訂單 ID</TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort(ordersSortBy, ordersSortOrder, 'customer_email', setOrdersSortBy, setOrdersSortOrder)}
                        >
                          <div className="flex items-center">
                            客戶信箱
                            {renderSortIcon('customer_email', ordersSortBy, ordersSortOrder)}
                          </div>
                        </TableHead>
                        <TableHead>產品</TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort(ordersSortBy, ordersSortOrder, 'quantity', setOrdersSortBy, setOrdersSortOrder)}
                        >
                          <div className="flex items-center">
                            數量
                            {renderSortIcon('quantity', ordersSortBy, ordersSortOrder)}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort(ordersSortBy, ordersSortOrder, 'total_price', setOrdersSortBy, setOrdersSortOrder)}
                        >
                          <div className="flex items-center">
                            總價
                            {renderSortIcon('total_price', ordersSortBy, ordersSortOrder)}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort(ordersSortBy, ordersSortOrder, 'payment_status', setOrdersSortBy, setOrdersSortOrder)}
                        >
                          <div className="flex items-center">
                            支付狀態
                            {renderSortIcon('payment_status', ordersSortBy, ordersSortOrder)}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort(ordersSortBy, ordersSortOrder, 'fulfillment_status', setOrdersSortBy, setOrdersSortOrder)}
                        >
                          <div className="flex items-center">
                            履行狀態
                            {renderSortIcon('fulfillment_status', ordersSortBy, ordersSortOrder)}
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSort(ordersSortBy, ordersSortOrder, 'created_at', setOrdersSortBy, setOrdersSortOrder)}
                        >
                          <div className="flex items-center">
                            創建時間
                            {renderSortIcon('created_at', ordersSortBy, ordersSortOrder)}
                          </div>
                        </TableHead>
                        <TableHead className="text-right">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginateData(
                        sortData(filterOrders(orders, ordersSearchQuery), ordersSortBy, ordersSortOrder), 
                        ordersCurrentPage
                      ).map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs">
                            {order.id.substring(0, 8)}...
                          </TableCell>
                          <TableCell>{order.customer_email}</TableCell>
                          <TableCell>
                            {order.denominations?.name || '-'}
                          </TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell className="font-medium">
                            ${order.total_price.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {order.payment_status === 'paid' ? (
                              <Badge variant="default" className="bg-green-500">已支付</Badge>
                            ) : order.payment_status === 'pending' ? (
                              <Badge variant="secondary">待支付</Badge>
                            ) : (
                              <Badge variant="destructive">失敗</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {getFulfillmentStatusBadge(order.fulfillment_status)}
                          </TableCell>
                          <TableCell>
                            {new Date(order.created_at).toLocaleDateString('zh-TW', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {order.fulfillment_status === 'processing' && 
                               order.payment_status === 'paid' && (
                                <Button
                                  size="sm"
                                  onClick={() => openFulfillmentDialog(order)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  履行訂單
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // View order details
                                  setSelectedOrder(order)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filterOrders(orders, ordersSearchQuery).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                            {ordersSearchQuery ? '沒有符合搜索條件的訂單' : '暫無訂單資料'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  {!ordersLoading && renderPagination(
                    ordersCurrentPage, 
                    filterOrders(orders, ordersSearchQuery).length, 
                    setOrdersCurrentPage
                  )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Order Details Card */}
            {selectedOrder && !fulfillmentDialogOpen && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>訂單詳情</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Label className="text-muted-foreground">訂單 ID</Label>
                      <p className="font-mono text-sm mt-1 break-all">{selectedOrder.id}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">客戶信箱</Label>
                      <p className="mt-1 break-all">{selectedOrder.customer_email}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">遊戲帳號</Label>
                      <p className="mt-1 break-all">{selectedOrder.game_login_username}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">購買數量</Label>
                      <p className="mt-1">{selectedOrder.quantity} 個</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">總價</Label>
                      <p className="mt-1 font-medium">${selectedOrder.total_price.toFixed(2)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">履行狀態</Label>
                      <div className="mt-1">
                        {selectedOrder.fulfillment_status === 'completed' ? (
                          <Badge variant="default" className="bg-blue-500">已完成</Badge>
                        ) : selectedOrder.fulfillment_status === 'processing' ? (
                          <Badge variant="default" className="bg-orange-500">處理中</Badge>
                        ) : (
                          <Badge variant="secondary">待處理</Badge>
                        )}
                      </div>
                    </div>
                    {selectedOrder.fulfilled_at && (
                      <div>
                        <Label className="text-muted-foreground">履行時間</Label>
                        <p className="mt-1 text-sm">
                          {new Date(selectedOrder.fulfilled_at).toLocaleString('zh-TW')}
                        </p>
                      </div>
                    )}
                    {selectedOrder.fulfillment_notes && (
                      <div className="sm:col-span-2">
                        <Label className="text-muted-foreground">履行備註</Label>
                        <p className="mt-1 text-sm">{selectedOrder.fulfillment_notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Fulfillment Dialog */}
          <Dialog open={fulfillmentDialogOpen} onOpenChange={setFulfillmentDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>履行訂單</DialogTitle>
                <DialogDescription>
                  確認履行此訂單？此操作將標記訂單為已完成。
                </DialogDescription>
              </DialogHeader>
              
              {selectedOrder && (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p><strong>訂單 ID:</strong> {selectedOrder.id.substring(0, 16)}...</p>
                        <p><strong>客戶:</strong> {selectedOrder.customer_email}</p>
                        <p><strong>遊戲帳號:</strong> {selectedOrder.game_login_username}</p>
                        <p><strong>產品:</strong> {selectedOrder.denominations?.name}</p>
                        <p><strong>數量:</strong> {selectedOrder.quantity}</p>
                      </div>
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label htmlFor="fulfillment_notes">履行備註（選填）</Label>
                    <Textarea
                      id="fulfillment_notes"
                      placeholder="例如：已成功充值、交易憑證號碼等"
                      value={fulfillmentNotes}
                      onChange={(e) => setFulfillmentNotes(e.target.value)}
                      rows={4}
                      className="mt-2"
                    />
                  </div>
                </div>
              )}

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFulfillmentDialogOpen(false)
                    setFulfillmentNotes('')
                  }}
                  disabled={fulfilling}
                  className="w-full sm:w-auto"
                >
                  取消
                </Button>
                <Button
                  onClick={handleFulfillOrder}
                  disabled={fulfilling}
                  className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                >
                  {fulfilling ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      履行中...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      確認履行
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Games Management Tab */}
          <TabsContent value="games" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <CardTitle>遊戲管理</CardTitle>
                    <CardDescription>管理遊戲清單及其相關設定</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={exportGames} className="w-full sm:w-auto">
                      <Download className="h-4 w-4 mr-2" />
                      導出 CSV
                    </Button>
                    <Button onClick={() => openCreateDialog('game')} className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      新增遊戲
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索遊戲名稱、代碼或描述..."
                    value={gamesSearchQuery}
                    onChange={(e) => {
                      setGamesSearchQuery(e.target.value)
                      setGamesCurrentPage(1)
                    }}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {paginateData(
                    sortData(filterGames(games, gamesSearchQuery), gamesSortBy, gamesSortOrder),
                    gamesCurrentPage
                  ).map((game) => (
                    <Card key={game.id}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <p className="font-medium">{game.name}</p>
                            <Badge variant="secondary" className="mt-1">{game.code}</Badge>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog('game', game)}
                              className="h-8"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete('game', game.id)}
                              className="h-8"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">伺服器區域</p>
                            <p>{getRegionName(game.region_code)}</p>
                          </div>
                          {game.description && (
                            <div>
                              <p className="text-xs text-muted-foreground">描述</p>
                              <p className="line-clamp-2">{game.description}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-xs text-muted-foreground">建立時間</p>
                            <p className="text-xs">{new Date(game.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filterGames(games, gamesSearchQuery).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      {gamesSearchQuery ? '沒有符合搜索條件的遊戲' : '暫無遊戲資料'}
                    </div>
                  )}
                </div>
                
                {/* Desktop Table View */}
                <Table className="hidden md:table">
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort(gamesSortBy, gamesSortOrder, 'name', setGamesSortBy, setGamesSortOrder)}
                      >
                        <div className="flex items-center">
                          遊戲名稱
                          {renderSortIcon('name', gamesSortBy, gamesSortOrder)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort(gamesSortBy, gamesSortOrder, 'code', setGamesSortBy, setGamesSortOrder)}
                      >
                        <div className="flex items-center">
                          代碼
                          {renderSortIcon('code', gamesSortBy, gamesSortOrder)}
                        </div>
                      </TableHead>
                      <TableHead>伺服器區域</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort(gamesSortBy, gamesSortOrder, 'created_at', setGamesSortBy, setGamesSortOrder)}
                      >
                        <div className="flex items-center">
                          建立時間
                          {renderSortIcon('created_at', gamesSortBy, gamesSortOrder)}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginateData(
                      sortData(filterGames(games, gamesSearchQuery), gamesSortBy, gamesSortOrder),
                      gamesCurrentPage
                    ).map((game) => (
                      <TableRow key={game.id}>
                        <TableCell className="font-medium">{game.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{game.code}</Badge>
                        </TableCell>
                        <TableCell>{getRegionName(game.region_code)}</TableCell>
                        <TableCell className="max-w-xs truncate">{game.description || '-'}</TableCell>
                        <TableCell>{new Date(game.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog('game', game)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete('game', game.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filterGames(games, gamesSearchQuery).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          {gamesSearchQuery ? '沒有符合搜索條件的遊戲' : '暫無遊戲資料'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {renderPagination(
                  gamesCurrentPage, 
                  filterGames(games, gamesSearchQuery).length, 
                  setGamesCurrentPage
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Denominations Management Tab */}
          <TabsContent value="denominations" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <CardTitle>產品面額管理</CardTitle>
                    <CardDescription>管理遊戲產品的面額、價格及相關設定</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={exportDenominations} className="w-full sm:w-auto">
                      <Download className="h-4 w-4 mr-2" />
                      導出 CSV
                    </Button>
                    <Button onClick={() => openCreateDialog('denomination')} className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      新增面額
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索面額名稱、SKU 代碼、遊戲或平台..."
                    value={denominationsSearchQuery}
                    onChange={(e) => {
                      setDenominationsSearchQuery(e.target.value)
                      setDenominationsCurrentPage(1)
                    }}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                {/* Mobile Card View for Denominations */}
                <div className="md:hidden space-y-3">
                  {paginateData(
                    sortData(filterDenominations(denominations, denominationsSearchQuery), denominationsSortBy, denominationsSortOrder),
                    denominationsCurrentPage
                  ).map((denomination) => (
                    <Card key={denomination.id} className="overflow-hidden">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{denomination.name}</p>
                            <div className="mt-1 flex gap-2 items-center flex-wrap">
                              <Badge variant="outline" className="text-xs">{getGameName(denomination.game_id)}</Badge>
                              <Badge variant="secondary" className="text-xs">{getPlatformName(denomination.platform_id)}</Badge>
                            </div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog('denomination', denomination)}
                              className="h-8"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete('denomination', denomination.id)}
                              className="h-8"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">促銷標籤</p>
                            <p>{getDisplayTagName(denomination.display_tag_id)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">價格 (USD)</p>
                            <p className="font-medium text-green-600">${denomination.display_price.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">成本</p>
                            <p className="text-muted-foreground">${denomination.cost_price.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">利潤</p>
                            <p className="font-medium">${(denomination.display_price - denomination.cost_price).toFixed(2)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filterDenominations(denominations, denominationsSearchQuery).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      {denominationsSearchQuery ? '沒有符合搜索條件的產品面額' : '暫無面額資料'}
                    </div>
                  )}
                </div>
                
                {/* Desktop Table View for Denominations */}
                <Table className="hidden md:table">
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort(denominationsSortBy, denominationsSortOrder, 'name', setDenominationsSortBy, setDenominationsSortOrder)}
                      >
                        <div className="flex items-center">
                          面額名稱
                          {renderSortIcon('name', denominationsSortBy, denominationsSortOrder)}
                        </div>
                      </TableHead>
                      <TableHead>遊戲</TableHead>
                      <TableHead>平台</TableHead>
                      <TableHead>促銷標籤</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort(denominationsSortBy, denominationsSortOrder, 'display_price', setDenominationsSortBy, setDenominationsSortOrder)}
                      >
                        <div className="flex items-center">
                          價格 (USD)
                          {renderSortIcon('display_price', denominationsSortBy, denominationsSortOrder)}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort(denominationsSortBy, denominationsSortOrder, 'cost_price', setDenominationsSortBy, setDenominationsSortOrder)}
                      >
                        <div className="flex items-center">
                          成本
                          {renderSortIcon('cost_price', denominationsSortBy, denominationsSortOrder)}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginateData(
                      sortData(filterDenominations(denominations, denominationsSearchQuery), denominationsSortBy, denominationsSortOrder),
                      denominationsCurrentPage
                    ).map((denomination) => (
                      <TableRow key={denomination.id}>
                        <TableCell className="font-medium">{denomination.name}</TableCell>
                        <TableCell>{getGameName(denomination.game_id)}</TableCell>
                        <TableCell>{getPlatformName(denomination.platform_id)}</TableCell>
                        <TableCell>{getDisplayTagName(denomination.display_tag_id)}</TableCell>
                        <TableCell>${denomination.display_price.toFixed(2)}</TableCell>
                        <TableCell>${denomination.cost_price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog('denomination', denomination)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete('denomination', denomination.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filterDenominations(denominations, denominationsSearchQuery).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          {denominationsSearchQuery ? '沒有符合搜索條件的產品面額' : '暫無面額資料'}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {renderPagination(
                  denominationsCurrentPage, 
                  filterDenominations(denominations, denominationsSearchQuery).length, 
                  setDenominationsCurrentPage
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Management Tab */}
          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Regions */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">伺服器區域</CardTitle>
                    <Button size="sm" onClick={() => openCreateDialog('region')}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {regions.map((region) => (
                    <div key={region.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{region.name}</p>
                        <p className="text-xs text-muted-foreground">{region.code}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog('region', region)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete('region', region.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {regions.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">暫無區域資料</p>
                  )}
                </CardContent>
              </Card>

              {/* Platforms */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">平台</CardTitle>
                    <Button size="sm" onClick={() => openCreateDialog('platform')}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {platforms.map((platform) => (
                    <div key={platform.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{platform.name}</p>
                        <p className="text-xs text-muted-foreground">{platform.code}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog('platform', platform)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete('platform', platform.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {platforms.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">暫無平台資料</p>
                  )}
                </CardContent>
              </Card>

              {/* Display Tags */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">促銷標籤</CardTitle>
                    <Button size="sm" onClick={() => openCreateDialog('displayTag')}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {displayTags.map((displayTag) => (
                    <div key={displayTag.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded border" 
                          style={{ backgroundColor: displayTag.color }}
                        />
                        <p className="font-medium text-sm">{displayTag.name}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog('displayTag', displayTag)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete('displayTag', displayTag.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {displayTags.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">暫無標籤資料</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Homepage Games Management Tab */}
          <TabsContent value="homepage-games" className="space-y-4">
            <HomepageGamesManager />
          </TabsContent>

          {/* RLS Test Tab */}
          <TabsContent value="rls-test" className="space-y-4">
            <div className="grid grid-cols-1 gap-6">
              <RLSTestPanel />
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit/Create Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? '編輯' : '新增'}{' '}
                {dialogType === 'region' && '伺服器區域'}
                {dialogType === 'platform' && '平台'}
                {dialogType === 'displayTag' && '促銷標籤'}
                {dialogType === 'game' && '遊戲'}
                {dialogType === 'denomination' && '產品面額'}
              </DialogTitle>
              <DialogDescription>
                {editingItem ? '編輯現有項目的資訊' : '填寫以下資訊來新增項目'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Common fields for regions and platforms */}
              {(dialogType === 'region' || dialogType === 'platform') && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-4 items-start sm:items-center gap-2 sm:gap-4">
                    <Label htmlFor="name" className="sm:text-right">名稱</Label>
                    <div className="sm:col-span-3">
                      <Input
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="輸入名稱"
                      />
                      {formErrors.name && (
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{formErrors.name}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="code" className="text-right">代碼</Label>
                    <div className="col-span-3">
                      <Input
                        id="code"
                        value={formData.code || ''}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="輸入代碼"
                      />
                      {formErrors.code && (
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{formErrors.code}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Display Tag fields */}
              {dialogType === 'displayTag' && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">名稱</Label>
                    <div className="col-span-3">
                      <Input
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="輸入標籤名稱"
                      />
                      {formErrors.name && (
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{formErrors.name}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="color" className="text-right">顏色</Label>
                    <div className="col-span-3">
                      <Input
                        id="color"
                        type="color"
                        value={formData.color || '#000000'}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-20"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Game fields */}
              {dialogType === 'game' && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">遊戲名稱</Label>
                    <div className="col-span-3">
                      <Input
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="輸入遊戲名稱"
                      />
                      {formErrors.name && (
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{formErrors.name}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="code" className="text-right">代碼</Label>
                    <div className="col-span-3">
                      <Input
                        id="code"
                        value={formData.code || ''}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="輸入遊戲代碼"
                      />
                      {formErrors.code && (
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{formErrors.code}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="regionId" className="text-right">伺服器區域</Label>
                    <div className="col-span-3">
                      <Select
                        value={formData.regionId || ''}
                        onValueChange={(value) => setFormData({ ...formData, regionId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選擇伺服器區域" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map((region) => (
                            <SelectItem key={region.id} value={region.id}>
                              {region.name} ({region.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.regionId && (
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{formErrors.regionId}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">描述</Label>
                    <div className="col-span-3">
                      <Textarea
                        id="description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="輸入遊戲描述（選填）"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="is_archived" className="text-right">已歸檔</Label>
                    <div className="col-span-3 flex items-center space-x-2">
                      <Switch
                        id="is_archived"
                        checked={formData.is_archived || false}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_archived: checked })}
                      />
                      <Label htmlFor="is_archived" className="text-sm text-muted-foreground cursor-pointer">
                        {formData.is_archived ? '是' : '否'}
                      </Label>
                    </div>
                  </div>
                </>
              )}

              {/* Denomination fields */}
              {dialogType === 'denomination' && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">面額名稱</Label>
                    <div className="col-span-3">
                      <Input
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="輸入面額名稱"
                      />
                      {formErrors.name && (
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{formErrors.name}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="gameId" className="text-right">遊戲</Label>
                    <div className="col-span-3">
                      <Select
                        value={formData.gameId || ''}
                        onValueChange={(value) => setFormData({ ...formData, gameId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選擇遊戲" />
                        </SelectTrigger>
                        <SelectContent>
                          {games.map((game) => (
                            <SelectItem key={game.id} value={game.id}>
                              {game.name} ({game.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.gameId && (
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{formErrors.gameId}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="platformId" className="text-right">平台</Label>
                    <div className="col-span-3">
                      <Select
                        value={formData.platformId || ''}
                        onValueChange={(value) => setFormData({ ...formData, platformId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選擇平台" />
                        </SelectTrigger>
                        <SelectContent>
                          {platforms.map((platform) => (
                            <SelectItem key={platform.id} value={platform.id}>
                              {platform.name} ({platform.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.platformId && (
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{formErrors.platformId}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="displayTagId" className="text-right">促銷標籤</Label>
                    <div className="col-span-3">
                      <Select
                        value={formData.displayTagId || ''}
                        onValueChange={(value) => setFormData({ ...formData, displayTagId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選擇促銷標籤（選填）" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">無標籤</SelectItem>
                          {displayTags.map((displayTag) => (
                            <SelectItem key={displayTag.id} value={displayTag.id}>
                              {displayTag.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="priceUSD" className="text-right">價格 (USD)</Label>
                    <div className="col-span-3">
                      <Input
                        id="priceUSD"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.priceUSD || ''}
                        onChange={(e) => setFormData({ ...formData, priceUSD: e.target.value })}
                        placeholder="0.00"
                      />
                      {formErrors.priceUSD && (
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{formErrors.priceUSD}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="cost" className="text-right">成本</Label>
                    <div className="col-span-3">
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.cost || ''}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        placeholder="0.00"
                      />
                      {formErrors.cost && (
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{formErrors.cost}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">描述</Label>
                    <div className="col-span-3">
                      <Textarea
                        id="description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="輸入面額描述（選填）"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="is_available" className="text-right">可購買</Label>
                    <div className="col-span-3 flex items-center space-x-2">
                      <Switch
                        id="is_available"
                        checked={formData.is_available !== false}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
                      />
                      <Label htmlFor="is_available" className="text-sm text-muted-foreground cursor-pointer">
                        {formData.is_available !== false ? '是' : '否'}
                      </Label>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="is_archived_denom" className="text-right">已歸檔</Label>
                    <div className="col-span-3 flex items-center space-x-2">
                      <Switch
                        id="is_archived_denom"
                        checked={formData.is_archived || false}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_archived: checked })}
                      />
                      <Label htmlFor="is_archived_denom" className="text-sm text-muted-foreground cursor-pointer">
                        {formData.is_archived ? '是' : '否'}
                      </Label>
                    </div>
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={closeDialog} className="w-full sm:w-auto">
                <X className="h-4 w-4 mr-2" />
                取消
              </Button>
              <Button onClick={handleSave} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                {editingItem ? '更新' : '新增'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      
      {/* Auth Debug Panel */}
      <AuthDebugPanel />
    </div>
  )
}