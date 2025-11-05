import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { AuthModal } from '../auth/auth-modal'
import { ProductPage } from './product-page'
import { useAuth } from '../auth/auth-provider'
import { SearchBar } from './SearchBar'
import { ImageWithFallback } from '../figma/ImageWithFallback'
import { gamesService } from '../../services'
import type { HomepageGame } from '../../types'
import { toast } from 'sonner@2.0.3'
import nomosxLogo from 'figma:asset/c5cb0566ff6ff95e598bf1b4595419d67010d507.png'
import { 
  User, 
  LogOut, 
  Shield,
  ShoppingCart,
  Zap,
  Lock,
  FileText,
  Award,
  Star,
  TrendingUp,
  ChevronRight,
  Sparkles
} from 'lucide-react'

/**
 * MainApp 組件的 Props 介面定義
 * 
 * @interface MainAppProps
 * 
 * @property {() => void} onNavigateToAdmin - 導航到 Admin Dashboard 的回調函數
 * 
 * @description
 * 此函數由父組件（Router）提供，用於處理從前台到後台的頁面切換。
 * 當用戶具有 admin 或 cs 角色時，導航欄會顯示「管理面板」按鈕，
 * 點擊後會觸發此回調函數。
 * 
 * @example
 * ```tsx
 * // 在 Router 組件中使用
 * <MainApp 
 *   onNavigateToAdmin={() => setCurrentPage('admin')} 
 * />
 * ```
 * 
 * @see {@link /components/router.tsx} Router 組件實現
 * @see {@link /components/admin-dashboard.tsx} Admin Dashboard
 */
interface MainAppProps {
  onNavigateToAdmin: () => void
}

export function MainApp({ onNavigateToAdmin }: MainAppProps) {
  const { user, userRole, isAuthenticated, logout } = useAuth()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login')
  const [showProducts, setShowProducts] = useState(false)
  const [hotGames, setHotGames] = useState<HomepageGame[]>([])
  const [gamesLoading, setGamesLoading] = useState(true)

  // Load games from API on mount
  useEffect(() => {
    loadGames()
  }, [])

  const loadGames = async () => {
    try {
      setGamesLoading(true)
      const { data, error } = await gamesService.getAllGames()

      if (!error && data?.games) {
        setHotGames(data.games)
      }
    } catch (error) {
      console.error('Load games error:', error)
    } finally {
      setGamesLoading(false)
    }
  }

  const handleOpenAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab)
    setIsAuthModalOpen(true)
  }

  const handleLogout = async () => {
    await logout()
    toast.success('已成功登出')
  }

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
  }



  // Features data
  const features = [
    {
      icon: Lock,
      title: 'AES-256 加密',
      description: '銀行級別安全加密，保護您的每一筆交易'
    },
    {
      icon: Zap,
      title: '即時到帳',
      description: '訂單處理速度快如閃電，平均 3 分鐘內完成'
    },
    {
      icon: FileText,
      title: '訂單追蹤',
      description: '完整的訂單記錄，隨時查看交易狀態'
    },
    {
      icon: Award,
      title: '官方授權',
      description: '所有商品均為官方正版，安心購買無憂'
    }
  ]

  // Show product page if requested
  if (showProducts) {
    return (
      <ProductPage 
        onNavigateBack={() => setShowProducts(false)}
      />
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0B0C10' }}>
      {/* Header Navigation */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{ 
          backgroundColor: 'rgba(18, 20, 26, 0.95)',
          borderColor: '#1F2937',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="max-w-[1280px] mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <motion.div 
                className="flex items-center gap-3 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-lg blur-md" style={{ backgroundColor: '#FFC107', opacity: 0.3 }}></div>
                  <div className="relative px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)', border: '1px solid #FFC107' }}>
                    <Sparkles className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#FFC107' }} />
                  </div>
                </div>
                <div>
                  <h1 className="text-lg md:text-2xl tracking-wide" style={{ color: '#FFC107', fontWeight: 700 }}>
                    NomosX
                  </h1>
                  <p className="text-xs hidden md:block" style={{ color: '#9EA3AE' }}>Power Your Game. Securely.</p>
                </div>
              </motion.div>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-md mx-6">
              <SearchBar />
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <div className="hidden md:flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback style={{ backgroundColor: '#FFC107', color: '#0B0C10' }}>
                        {getInitials(user?.user_metadata?.full_name || user?.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <p style={{ color: '#EAEAEA' }}>{user?.user_metadata?.full_name || user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {(userRole === 'admin' || userRole === 'cs') && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={onNavigateToAdmin}
                        className="border"
                        style={{ 
                          borderColor: '#FFC107', 
                          color: '#FFC107',
                          backgroundColor: 'transparent'
                        }}
                      >
                        <Shield className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">管理面板</span>
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleLogout}
                      style={{ 
                        borderColor: '#9EA3AE', 
                        color: '#9EA3AE',
                        backgroundColor: 'transparent'
                      }}
                    >
                      <LogOut className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">登出</span>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenAuthModal('login')}
                    className="border transition-all duration-300"
                    style={{ 
                      borderColor: '#FFC107', 
                      color: '#FFC107',
                      backgroundColor: 'transparent'
                    }}
                  >
                    登入
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => handleOpenAuthModal('register')}
                    className="transition-all duration-300 hover:scale-105"
                    style={{ 
                      backgroundColor: '#FFC107', 
                      color: '#0B0C10',
                      boxShadow: '0 0 20px rgba(255, 193, 7, 0.3)'
                    }}
                  >
                    註冊
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pt-16 md:pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden" style={{ minHeight: '600px' }}>
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            {/* NomosX Logo Background (图片1) */}
            <ImageWithFallback
              src={nomosxLogo}
              alt="NomosX Logo Background"
              className="w-full h-full object-cover"
            />
            
            {/* Gradient Overlay (图片2 - 渐变效果) */}
            <div className="absolute inset-0" style={{ 
              background: 'linear-gradient(135deg, rgba(11, 12, 16, 0.9) 0%, rgba(11, 12, 16, 0.7) 50%, rgba(0, 224, 255, 0.1) 100%)'
            }}></div>
            
            {/* Animated particles effect */}
            <div className="absolute inset-0 opacity-30">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full"
                  style={{ 
                    backgroundColor: i % 2 === 0 ? '#FFC107' : '#00E0FF',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0.2, 1, 0.2],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </div>
          </div>

          {/* Hero Content */}
          <div className="relative max-w-[1280px] mx-auto px-4 md:px-6 py-20 md:py-32">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block mb-4"
              >
                <Badge 
                  className="px-4 py-1.5 text-sm border"
                  style={{ 
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    borderColor: '#FFC107',
                    color: '#FFC107'
                  }}
                >
                  NomosX遊戲點數交易平台
                </Badge>
              </motion.div>

              <h1 
                className="mb-6 leading-tight"
                style={{ 
                  fontSize: 'clamp(32px, 6vw, 48px)',
                  fontWeight: 700,
                  color: '#EAEAEA',
                  textShadow: '0 0 30px rgba(255, 193, 7, 0.3)'
                }}
              >
                安全、便捷的遊戲代儲平台
              </h1>
              
              <p 
                className="mb-10 text-lg md:text-xl leading-relaxed"
                style={{ color: '#9EA3AE' }}
              >
                NomosX — 您的專業遊戲點數交易與管理平台<br />
                支援全球熱門遊戲，極速到帳，安全可靠
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg"
                    onClick={() => setShowProducts(true)}
                    className="px-8 py-6 text-base transition-all duration-300"
                    style={{ 
                      backgroundColor: '#FFC107', 
                      color: '#0B0C10',
                      boxShadow: '0 0 30px rgba(255, 193, 7, 0.5)',
                      border: 'none'
                    }}
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    立即購買點數
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="px-8 py-6 text-base border-2 transition-all duration-300"
                    style={{ 
                      borderColor: '#00E0FF',
                      color: '#00E0FF',
                      backgroundColor: 'transparent'
                    }}
                  >
                    了解更多
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Hot Games Section */}
        <section className="py-20" style={{ backgroundColor: '#0B0C10' }}>
          <div className="max-w-[1280px] mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 rounded-full" style={{ backgroundColor: '#FFC107' }}></div>
                  <h2 className="text-3xl md:text-4xl" style={{ color: '#EAEAEA', fontWeight: 700 }}>
                    熱門遊戲
                  </h2>
                  <Star className="w-6 h-6" style={{ color: '#FFC107' }} />
                </div>
                <Button 
                  variant="ghost" 
                  className="text-sm"
                  style={{ color: '#9EA3AE' }}
                  onClick={() => setShowProducts(true)}
                >
                  查看全部
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <p style={{ color: '#9EA3AE' }}>精選最受歡迎的遊戲，快速充值體驗</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotGames.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group cursor-pointer"
                  onClick={() => setShowProducts(true)}
                >
                  <Card 
                    className="overflow-hidden border-0 transition-all duration-300"
                    style={{ 
                      backgroundColor: '#12141A',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <div className="relative overflow-hidden">
                      <ImageWithFallback
                        src={game.cover}
                        alt={game.name}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Glow effect on hover */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ 
                          boxShadow: 'inset 0 0 60px rgba(0, 224, 255, 0.3)',
                          border: '1px solid rgba(0, 224, 255, 0.5)'
                        }}
                      ></div>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {game.badge && (
                          <Badge 
                            className="px-2 py-1 text-xs"
                            style={{ 
                              backgroundColor: game.badge === '熱門' ? '#FFC107' : '#00E0FF',
                              color: '#0B0C10',
                              border: 'none'
                            }}
                          >
                            {game.badge}
                          </Badge>
                        )}
                        {game.discount && (
                          <Badge 
                            className="px-2 py-1 text-xs"
                            style={{ 
                              backgroundColor: '#FF5252',
                              color: '#FFFFFF',
                              border: 'none'
                            }}
                          >
                            {game.discount}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <CardContent className="p-5">
                      <h3 className="mb-2 text-lg" style={{ color: '#EAEAEA', fontWeight: 600 }}>
                        {game.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm" style={{ color: '#FFC107', fontWeight: 600 }}>
                          {game.price}
                        </span>
                        <Button 
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-all duration-300"
                          style={{ 
                            backgroundColor: 'rgba(255, 193, 7, 0.1)',
                            color: '#FFC107',
                            border: '1px solid #FFC107'
                          }}
                        >
                          立即購買
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Special Offers Section */}
        <section className="py-20" style={{ backgroundColor: 'rgba(18, 20, 26, 0.5)' }}>
          <div className="max-w-[1280px] mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-8 rounded-full" style={{ backgroundColor: '#00E0FF' }}></div>
                <h2 className="text-3xl md:text-4xl" style={{ color: '#EAEAEA', fontWeight: 700 }}>
                  限時優惠
                </h2>
                <Sparkles className="w-6 h-6" style={{ color: '#00E0FF' }} />
              </div>
              <p style={{ color: '#9EA3AE' }}>把握機會，享受超值優惠活動</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden rounded-2xl cursor-pointer group"
                style={{ 
                  backgroundColor: '#12141A',
                  border: '1px solid rgba(255, 193, 7, 0.3)',
                  minHeight: '200px'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFC107]/20 to-transparent"></div>
                <div className="relative p-8 flex flex-col justify-center h-full">
                  <Badge className="mb-4 w-fit" style={{ backgroundColor: '#FFC107', color: '#0B0C10' }}>
                    限時 3 天
                  </Badge>
                  <h3 className="text-2xl mb-2" style={{ color: '#EAEAEA', fontWeight: 700 }}>
                    新用戶首單 8 折
                  </h3>
                  <p className="mb-4" style={{ color: '#9EA3AE' }}>
                    註冊即享優惠，最高可省 $500
                  </p>
                  <Button 
                    className="w-fit transition-all duration-300 group-hover:shadow-lg"
                    style={{ 
                      backgroundColor: '#FFC107',
                      color: '#0B0C10'
                    }}
                  >
                    立即領取
                  </Button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden rounded-2xl cursor-pointer group"
                style={{ 
                  backgroundColor: '#12141A',
                  border: '1px solid rgba(0, 224, 255, 0.3)',
                  minHeight: '200px'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00E0FF]/20 to-transparent"></div>
                <div className="relative p-8 flex flex-col justify-center h-full">
                  <Badge className="mb-4 w-fit" style={{ backgroundColor: '#00E0FF', color: '#0B0C10' }}>
                    每週特惠
                  </Badge>
                  <h3 className="text-2xl mb-2" style={{ color: '#EAEAEA', fontWeight: 700 }}>
                    會員專屬回饋
                  </h3>
                  <p className="mb-4" style={{ color: '#9EA3AE' }}>
                    累積消費送積分，積分當錢花
                  </p>
                  <Button 
                    className="w-fit transition-all duration-300 group-hover:shadow-lg"
                    style={{ 
                      backgroundColor: '#00E0FF',
                      color: '#0B0C10'
                    }}
                  >
                    了解詳情
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20" style={{ backgroundColor: '#0B0C10' }}>
          <div className="max-w-[1280px] mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl mb-4" style={{ color: '#EAEAEA', fontWeight: 700 }}>
                為什麼選擇 NomosX
              </h2>
              <p style={{ color: '#9EA3AE' }}>
                專業、安全、快速的遊戲點數交易平台
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card 
                    className="p-6 border transition-all duration-300 hover:shadow-2xl group cursor-pointer"
                    style={{ 
                      backgroundColor: '#12141A',
                      borderColor: 'transparent',
                      height: '100%'
                    }}
                  >
                    <div className="flex flex-col items-center text-center h-full">
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                        className="mb-4 p-4 rounded-xl"
                        style={{ 
                          backgroundColor: 'rgba(255, 193, 7, 0.1)',
                          border: '1px solid rgba(255, 193, 7, 0.3)'
                        }}
                      >
                        <feature.icon className="w-8 h-8" style={{ color: '#FFC107' }} />
                      </motion.div>
                      
                      <h3 className="mb-3 text-lg" style={{ color: '#EAEAEA', fontWeight: 600 }}>
                        {feature.title}
                      </h3>
                      
                      <p className="text-sm leading-relaxed" style={{ color: '#9EA3AE' }}>
                        {feature.description}
                      </p>

                      {/* Hover glow effect */}
                      <div 
                        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        style={{ 
                          boxShadow: '0 0 40px rgba(255, 193, 7, 0.1)',
                          border: '1px solid rgba(255, 193, 7, 0.2)'
                        }}
                      ></div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 border-t" style={{ backgroundColor: '#12141A', borderColor: '#1F2937' }}>
          <div className="max-w-[1280px] mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
              {/* About */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)' }}>
                    <Sparkles className="w-5 h-5" style={{ color: '#FFC107' }} />
                  </div>
                  <h3 className="text-xl" style={{ color: '#FFC107', fontWeight: 700 }}>NomosX</h3>
                </div>
                <p className="mb-4 text-sm" style={{ color: '#9EA3AE' }}>
                  專業的遊戲點數交易平台，致力於提供安全、便捷、快速的代儲服務。
                </p>
                <p className="text-xs" style={{ color: '#9EA3AE' }}>
                  © 2025 NomosX. All rights reserved.
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="mb-4 text-sm" style={{ color: '#EAEAEA', fontWeight: 600 }}>
                  快速連結
                </h4>
                <ul className="space-y-2 text-sm">
                  {['關於我們', '服務條款', '隱私政策', '常見問題', '聯絡客服'].map((link) => (
                    <li key={link}>
                      <a 
                        href="#" 
                        className="transition-colors duration-200 hover:text-[#FFC107]"
                        style={{ color: '#9EA3AE' }}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="mb-4 text-sm" style={{ color: '#EAEAEA', fontWeight: 600 }}>
                  聯絡我們
                </h4>
                <div className="space-y-3">
                  <a 
                    href="#"
                    className="flex items-center gap-2 text-sm transition-colors duration-200 hover:text-[#FFC107]"
                    style={{ color: '#9EA3AE' }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 193, 7, 0.1)' }}>
                      <User className="w-4 h-4" style={{ color: '#FFC107' }} />
                    </div>
                    Discord 社群
                  </a>
                  <a 
                    href="#"
                    className="flex items-center gap-2 text-sm transition-colors duration-200 hover:text-[#00E0FF]"
                    style={{ color: '#9EA3AE' }}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 224, 255, 0.1)' }}>
                      <User className="w-4 h-4" style={{ color: '#00E0FF' }} />
                    </div>
                    Telegram 客服
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t text-center" style={{ borderColor: '#1F2937' }}>
              <p className="text-xs" style={{ color: '#9EA3AE' }}>
                NomosX 是獨立運營的第三方遊戲點數交易平台，所有遊戲商標、品牌名稱均為其各自所有者的財產。
              </p>
            </div>
          </div>
        </footer>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
      />
    </div>
  )
}