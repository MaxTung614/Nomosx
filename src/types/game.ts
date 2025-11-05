/**
 * 游戏相关类型定义
 * 
 * @description
 * 集中管理游戏、面额相关的 TypeScript 类型
 */

// 游戏基础信息
export interface Game {
  id: string
  name: string
  code?: string
  region_code: string
  description?: string
  cover_url?: string
  is_archived?: boolean
  created_at: string
  updated_at?: string
}

// 游戏详情（包含关联数据）
export interface GameDetail extends Game {
  region?: Region
  denominations?: Denomination[]
}

// 区域信息
export interface Region {
  id: string
  region_code: string
  region_name: string
  is_archived?: boolean
  created_at: string
  updated_at?: string
}

// 平台信息
export interface Platform {
  id: string
  platform_code: string
  platform_name: string
  is_archived?: boolean
  created_at: string
  updated_at?: string
}

// 显示标签
export interface DisplayTag {
  id: string
  tag_name: string
  tag_color: string
  is_archived?: boolean
  created_at: string
  updated_at?: string
}

// 面额信息
export interface Denomination {
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

// 面额详情（包含关联数据）
export interface DenominationDetail extends Denomination {
  game?: Game
  platform?: Platform
  displayTag?: DisplayTag
}

// 首页游戏卡片
export interface HomepageGame {
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

// 创建游戏请求
export interface CreateGameRequest {
  name: string
  code?: string
  region_code: string
  description?: string
  cover_url?: string
}

// 更新游戏请求
export interface UpdateGameRequest {
  name?: string
  code?: string
  region_code?: string
  description?: string
  cover_url?: string
  is_archived?: boolean
}

// 创建面额请求
export interface CreateDenominationRequest {
  game_id: string
  platform_id: string
  display_tag_id?: string
  name: string
  display_price: number
  cost_price: number
  sku_code?: string
  description?: string
}

// 更新面额请求
export interface UpdateDenominationRequest {
  name?: string
  display_price?: number
  cost_price?: number
  sku_code?: string
  is_available?: boolean
  is_archived?: boolean
  description?: string
}

// 游戏列表查询参数
export interface GameListParams {
  region_code?: string
  is_archived?: boolean
  search?: string
  page?: number
  limit?: number
}
