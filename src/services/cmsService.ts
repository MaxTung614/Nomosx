// ====================================================================================================
// 文件名: services/cmsService.ts
// 描述: CMS 内容管理服务
// 最后更新: 2025-11-05
// ====================================================================================================

import { apiGet, apiPost, apiPut, apiDelete, API_ENDPOINTS } from './api.config'
import type { Region, Platform, DisplayTag, Game, Denomination, ApiResponse } from '../types'

/**
 * CMS 服务类
 */
export class CMSService {
  // ===================================
  // 区域管理 (Regions Management)
  // ===================================
  
  static async getAllRegions(): Promise<ApiResponse<{ regions: Region[] }>> {
    return apiGet(API_ENDPOINTS.cms.regions.list, { requireAuth: true })
  }

  static async getRegionById(id: string): Promise<ApiResponse<{ region: Region }>> {
    return apiGet(API_ENDPOINTS.cms.regions.detail(id), { requireAuth: true })
  }

  static async createRegion(data: {
    region_code: string
    region_name: string
  }): Promise<ApiResponse<{ region: Region }>> {
    return apiPost(API_ENDPOINTS.cms.regions.create, data, { requireAuth: true })
  }

  static async updateRegion(id: string, data: {
    region_code: string
    region_name: string
  }): Promise<ApiResponse<{ region: Region }>> {
    return apiPut(API_ENDPOINTS.cms.regions.update(id), data, { requireAuth: true })
  }

  static async deleteRegion(id: string): Promise<ApiResponse<void>> {
    return apiDelete(API_ENDPOINTS.cms.regions.delete(id), { requireAuth: true })
  }

  // ===================================
  // 平台管理 (Platforms Management)
  // ===================================
  
  static async getAllPlatforms(): Promise<ApiResponse<{ platforms: Platform[] }>> {
    return apiGet(API_ENDPOINTS.cms.platforms.list, { requireAuth: true })
  }

  static async getPlatformById(id: string): Promise<ApiResponse<{ platform: Platform }>> {
    return apiGet(API_ENDPOINTS.cms.platforms.detail(id), { requireAuth: true })
  }

  static async createPlatform(data: {
    platform_code: string
    platform_name: string
  }): Promise<ApiResponse<{ platform: Platform }>> {
    return apiPost(API_ENDPOINTS.cms.platforms.create, data, { requireAuth: true })
  }

  static async updatePlatform(id: string, data: {
    platform_code: string
    platform_name: string
  }): Promise<ApiResponse<{ platform: Platform }>> {
    return apiPut(API_ENDPOINTS.cms.platforms.update(id), data, { requireAuth: true })
  }

  static async deletePlatform(id: string): Promise<ApiResponse<void>> {
    return apiDelete(API_ENDPOINTS.cms.platforms.delete(id), { requireAuth: true })
  }

  // ===================================
  // 促销标签管理 (Display Tags Management)
  // ===================================
  
  static async getAllDisplayTags(): Promise<ApiResponse<{ displayTags: DisplayTag[] }>> {
    return apiGet(API_ENDPOINTS.cms.displayTags.list, { requireAuth: true })
  }

  static async getDisplayTagById(id: string): Promise<ApiResponse<{ displayTag: DisplayTag }>> {
    return apiGet(API_ENDPOINTS.cms.displayTags.detail(id), { requireAuth: true })
  }

  static async createDisplayTag(data: {
    tag_name: string
    tag_color: string
  }): Promise<ApiResponse<{ displayTag: DisplayTag }>> {
    return apiPost(API_ENDPOINTS.cms.displayTags.create, data, { requireAuth: true })
  }

  static async updateDisplayTag(id: string, data: {
    tag_name: string
    tag_color: string
  }): Promise<ApiResponse<{ displayTag: DisplayTag }>> {
    return apiPut(API_ENDPOINTS.cms.displayTags.update(id), data, { requireAuth: true })
  }

  static async deleteDisplayTag(id: string): Promise<ApiResponse<void>> {
    return apiDelete(API_ENDPOINTS.cms.displayTags.delete(id), { requireAuth: true })
  }

  // ===================================
  // 游戏管理 (Games Management)
  // ===================================
  
  static async getAllGames(): Promise<ApiResponse<{ games: Game[] }>> {
    return apiGet(API_ENDPOINTS.cms.games.list, { requireAuth: true })
  }

  static async getGameById(id: string): Promise<ApiResponse<{ game: Game }>> {
    return apiGet(API_ENDPOINTS.cms.games.detail(id), { requireAuth: true })
  }

  static async createGame(data: {
    name: string
    code?: string
    region_code: string
    description?: string
  }): Promise<ApiResponse<{ game: Game }>> {
    return apiPost(API_ENDPOINTS.cms.games.create, data, { requireAuth: true })
  }

  static async updateGame(id: string, data: Partial<{
    name: string
    code: string
    region_code: string
    description: string
  }>): Promise<ApiResponse<{ game: Game }>> {
    return apiPut(API_ENDPOINTS.cms.games.update(id), data, { requireAuth: true })
  }

  static async deleteGame(id: string): Promise<ApiResponse<void>> {
    return apiDelete(API_ENDPOINTS.cms.games.delete(id), { requireAuth: true })
  }

  // ===================================
  // 产品面额管理 (Denominations Management)
  // ===================================
  
  static async getAllDenominations(): Promise<ApiResponse<{ denominations: Denomination[] }>> {
    return apiGet(API_ENDPOINTS.cms.denominations.list, { requireAuth: true })
  }

  static async getDenominationById(id: string): Promise<ApiResponse<{ denomination: Denomination }>> {
    return apiGet(API_ENDPOINTS.cms.denominations.detail(id), { requireAuth: true })
  }

  static async createDenomination(data: {
    game_id: string
    platform_id: string
    display_tag_id?: string
    name: string
    display_price: number
    cost_price: number
    sku_code?: string
    description?: string
  }): Promise<ApiResponse<{ denomination: Denomination }>> {
    return apiPost(API_ENDPOINTS.cms.denominations.create, data, { requireAuth: true })
  }

  static async updateDenomination(id: string, data: Partial<{
    game_id: string
    platform_id: string
    display_tag_id: string
    name: string
    display_price: number
    cost_price: number
    sku_code: string
    is_available: boolean
    description: string
  }>): Promise<ApiResponse<{ denomination: Denomination }>> {
    return apiPut(API_ENDPOINTS.cms.denominations.update(id), data, { requireAuth: true })
  }

  static async deleteDenomination(id: string): Promise<ApiResponse<void>> {
    return apiDelete(API_ENDPOINTS.cms.denominations.delete(id), { requireAuth: true })
  }

  // ===================================
  // 批量操作 (Batch Operations)
  // ===================================
  
  /**
   * 批量加载所有 CMS 数据
   */
  static async loadAllCMSData(): Promise<{
    regions: Region[]
    platforms: Platform[]
    displayTags: DisplayTag[]
    games: Game[]
    denominations: Denomination[]
  }> {
    const [regionsRes, platformsRes, displayTagsRes, gamesRes, denominationsRes] = await Promise.all([
      this.getAllRegions(),
      this.getAllPlatforms(),
      this.getAllDisplayTags(),
      this.getAllGames(),
      this.getAllDenominations(),
    ])

    return {
      regions: regionsRes.data?.regions || [],
      platforms: platformsRes.data?.platforms || [],
      displayTags: displayTagsRes.data?.displayTags || [],
      games: gamesRes.data?.games || [],
      denominations: denominationsRes.data?.denominations || [],
    }
  }
}

// 导出默认实例
export const cmsService = CMSService
