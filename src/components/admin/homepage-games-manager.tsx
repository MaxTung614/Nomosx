import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Alert, AlertDescription } from '../ui/alert'
import { authHelpers } from '../../utils/supabase/client'
import { projectId } from '../../utils/supabase/info'
import { toast } from 'sonner@2.0.3'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Upload, 
  Search, 
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Sparkles,
  ImageIcon
} from 'lucide-react'

interface HomepageGame {
  id: string
  name: string
  coverUrl: string
  price: string
  badge: string | null
  discount: string | null
  order: number
  createdAt: string
  updatedAt: string
}

interface HomepageGamesManagerProps {
  onDataUpdate?: () => void
}

export function HomepageGamesManager({ onDataUpdate }: HomepageGamesManagerProps) {
  const [games, setGames] = useState<HomepageGame[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<string>('order')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGame, setEditingGame] = useState<HomepageGame | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    loadGames()
  }, [])

  const loadGames = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-04b375d8/games`,
        { signal: AbortSignal.timeout(15000) }
      )

      if (response.ok) {
        const data = await response.json()
        setGames(data.games || [])
        onDataUpdate?.()
      } else {
        toast.error('載入首頁游戲失敗')
      }
    } catch (error) {
      console.error('Failed to load homepage games:', error)
      if (error instanceof Error && error.name === 'TimeoutError') {
        toast.error('載入超時，請檢查網路連線')
      } else {
        toast.error('載入首頁游戲失敗')
      }
    } finally {
      setLoading(false)
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
          signal: AbortSignal.timeout(30000)
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
        toast.error('圖片上傳超時')
      }
      throw error
    } finally {
      setUploadingImage(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('請選擇圖片檔案')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('圖片大小不能超過 5MB')
      return
    }

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload image
      const url = await handleImageUpload(file)
      setFormData({ ...formData, coverUrl: url })
    } catch (error) {
      // Error already handled in handleImageUpload
    }
  }

  const openCreateDialog = () => {
    setEditingGame(null)
    setFormData({
      name: '',
      coverUrl: '',
      price: '即刻充值',
      badge: '熱門',
      discount: null,
      order: games.length
    })
    setFormErrors({})
    setImagePreview(null)
    setDialogOpen(true)
  }

  const openEditDialog = (game: HomepageGame) => {
    setEditingGame(game)
    setFormData({ ...game })
    setFormErrors({})
    setImagePreview(game.coverUrl)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingGame(null)
    setFormData({})
    setFormErrors({})
    setImagePreview(null)
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name?.trim()) errors.name = '游戲名稱為必填項目'
    if (!formData.coverUrl?.trim()) errors.coverUrl = '封面圖片為必填項目'
    if (!formData.price?.trim()) errors.price = '價格顯示為必填項目'
    if (formData.order === undefined || formData.order === '' || isNaN(Number(formData.order)) || Number(formData.order) < 0) {
      errors.order = '請輸入有效的排序數字'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      const { access_token, error: sessionError } = await authHelpers.getSession()
      
      if (sessionError || !access_token) {
        toast.error('會話已過期，請重新登入')
        return
      }
      
      const baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-04b375d8`
      const endpoint = editingGame 
        ? `${baseUrl}/games/${editingGame.id}`
        : `${baseUrl}/games`
      const method = editingGame ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        signal: AbortSignal.timeout(10000)
      })

      if (response.ok) {
        toast.success(editingGame ? '更新成功' : '新增成功')
        closeDialog()
        await loadGames()
      } else {
        const error = await response.json()
        toast.error(error.error || '操作失敗')
      }
    } catch (error) {
      console.error('Save error:', error)
      if (error instanceof Error && error.name === 'TimeoutError') {
        toast.error('請求超時')
      } else {
        toast.error('保存時發生錯誤')
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此首頁游戲嗎？此操作無法撤銷。')) return

    try {
      const { access_token, error: sessionError } = await authHelpers.getSession()
      
      if (sessionError || !access_token) {
        toast.error('會話已過期，請重新登入')
        return
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-04b375d8/games/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${access_token}`
          },
          signal: AbortSignal.timeout(10000)
        }
      )

      if (response.ok) {
        toast.success('刪除成功')
        await loadGames()
      } else {
        const error = await response.json()
        toast.error(error.error || '刪除失敗')
      }
    } catch (error) {
      console.error('Delete error:', error)
      if (error instanceof Error && error.name === 'TimeoutError') {
        toast.error('請求超時')
      } else {
        toast.error('刪除時發生錯誤')
      }
    }
  }

  const filterGames = (games: HomepageGame[], query: string): HomepageGame[] => {
    if (!query.trim()) return games
    const lowerQuery = query.toLowerCase()
    return games.filter(game => 
      game.name?.toLowerCase().includes(lowerQuery) ||
      game.badge?.toLowerCase().includes(lowerQuery)
    )
  }

  const sortData = (data: HomepageGame[]): HomepageGame[] => {
    return [...data].sort((a, b) => {
      let aValue = a[sortBy as keyof HomepageGame]
      let bValue = b[sortBy as keyof HomepageGame]

      if (aValue == null) return 1
      if (bValue == null) return -1

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }

      return 0
    })
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-40" />
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1" />
      : <ArrowDown className="h-4 w-4 ml-1" />
  }

  const exportToCSV = () => {
    const filteredGames = filterGames(games, searchQuery)
    const headers = ['ID', '游戲名稱', '價格顯示', '標籤', '折扣', '排序', '封面URL', '創建時間', '更新時間']
    const csvData = [
      headers.join(','),
      ...filteredGames.map(game => [
        game.id,
        `"${game.name}"`,
        `"${game.price}"`,
        game.badge || '',
        game.discount || '',
        game.order,
        `"${game.coverUrl}"`,
        new Date(game.createdAt).toLocaleString('zh-TW'),
        new Date(game.updatedAt).toLocaleString('zh-TW')
      ].join(','))
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvData], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `homepage-games_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success(`已導出 ${filteredGames.length} 條記錄`)
  }

  const filteredAndSortedGames = sortData(filterGames(games, searchQuery))

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                首頁游戲管理
              </CardTitle>
              <CardDescription>管理首頁顯示的熱門游戲卡片</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button onClick={loadGames} variant="outline" className="w-full sm:w-auto">
                重新載入
              </Button>
              <Button onClick={exportToCSV} variant="outline" className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                導出 CSV
              </Button>
              <Button onClick={openCreateDialog} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                新增游戲
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索游戲名稱或標籤..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">載入中...</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <Table className="hidden md:table">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">封面</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        游戲名稱
                        {renderSortIcon('name')}
                      </div>
                    </TableHead>
                    <TableHead>價格顯示</TableHead>
                    <TableHead>標籤</TableHead>
                    <TableHead>折扣</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('order')}
                    >
                      <div className="flex items-center">
                        排序
                        {renderSortIcon('order')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center">
                        創建時間
                        {renderSortIcon('createdAt')}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedGames.map((game) => (
                    <TableRow key={game.id}>
                      <TableCell>
                        <div className="w-16 h-16 rounded overflow-hidden bg-muted">
                          <img 
                            src={game.coverUrl} 
                            alt={game.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23ddd" width="64" height="64"/%3E%3C/svg%3E'
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{game.name}</TableCell>
                      <TableCell>{game.price}</TableCell>
                      <TableCell>
                        {game.badge && (
                          <Badge variant="secondary">{game.badge}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {game.discount && (
                          <Badge variant="destructive">{game.discount}</Badge>
                        )}
                      </TableCell>
                      <TableCell>{game.order}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(game.createdAt).toLocaleString('zh-TW', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(game)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(game.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {filteredAndSortedGames.map((game) => (
                  <Card key={game.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-muted">
                          <img 
                            src={game.coverUrl} 
                            alt={game.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23ddd" width="80" height="80"/%3E%3C/svg%3E'
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{game.name}</h3>
                          <p className="text-sm text-muted-foreground">{game.price}</p>
                          <div className="flex gap-1 mt-2">
                            {game.badge && (
                              <Badge variant="secondary" className="text-xs">{game.badge}</Badge>
                            )}
                            {game.discount && (
                              <Badge variant="destructive" className="text-xs">{game.discount}</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            排序: {game.order} | {new Date(game.createdAt).toLocaleDateString('zh-TW')}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(game)}
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          編輯
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(game.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          刪除
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredAndSortedGames.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? '沒有符合搜索條件的游戲' : '暫無游戲資料'}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingGame ? '編輯首頁游戲' : '新增首頁游戲'}
            </DialogTitle>
            <DialogDescription>
              {editingGame ? '編輯現有游戲的資訊' : '填寫以下資訊來新增游戲'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="coverImage">封面圖片 *</Label>
              <div className="flex flex-col gap-2">
                {imagePreview && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImagePreview(null)
                        setFormData({ ...formData, coverUrl: '' })
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    id="coverImage"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploadingImage}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploadingImage}
                    onClick={() => document.getElementById('coverImage')?.click()}
                  >
                    {uploadingImage ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                        上傳中...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        選擇圖片
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  支援 JPG, PNG, GIF。最大 5MB
                </p>
              </div>
              {formErrors.coverUrl && (
                <Alert variant="destructive">
                  <AlertDescription>{formErrors.coverUrl}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Game Name */}
            <div className="space-y-2">
              <Label htmlFor="name">游戲名稱 *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如: Valorant"
              />
              {formErrors.name && (
                <Alert variant="destructive">
                  <AlertDescription>{formErrors.name}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Price Display */}
            <div className="space-y-2">
              <Label htmlFor="price">價格顯示 *</Label>
              <Input
                id="price"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="例如: 即刻充值 或 $9.99 起"
              />
              {formErrors.price && (
                <Alert variant="destructive">
                  <AlertDescription>{formErrors.price}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Badge */}
            <div className="space-y-2">
              <Label htmlFor="badge">標籤（選填）</Label>
              <Input
                id="badge"
                value={formData.badge || ''}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="例如: 熱門, 新品, 推薦"
              />
            </div>

            {/* Discount */}
            <div className="space-y-2">
              <Label htmlFor="discount">折扣標籤（選填）</Label>
              <Input
                id="discount"
                value={formData.discount || ''}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                placeholder="例如: -10%, -20%"
              />
            </div>

            {/* Order */}
            <div className="space-y-2">
              <Label htmlFor="order">排序 *</Label>
              <Input
                id="order"
                type="number"
                value={formData.order ?? ''}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                placeholder="數字越小排序越前"
                min="0"
              />
              {formErrors.order && (
                <Alert variant="destructive">
                  <AlertDescription>{formErrors.order}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={uploadingImage}>
              {editingGame ? '更新' : '新增'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
