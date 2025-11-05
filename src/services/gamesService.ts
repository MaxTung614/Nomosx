// ====================================================================================================
// 文件名: services/gamesService.ts
// 描述: 首页游戏管理服务
// 最后更新: 2025-11-05
// ====================================================================================================

import { apiGet, apiPost, apiPut, apiDelete, apiUpload, API_ENDPOINTS } from './api.config'
import type { HomepageGame, ApiResponse, ImageUploadResponse } from '../types'

/**
 * 游戏管理服务类
 */
export class GamesService {
  /**
   * 获取所有首页游戏（公开接口，无需认证）
   */
  static async getAllGames(): Promise<ApiResponse<{ games: HomepageGame[] }>> {
    return apiGet(API_ENDPOINTS.games.list, { requireAuth: false })
  }

  /**
   * 获取单个游戏详情
   */
  static async getGameById(id: string): Promise<ApiResponse<{ game: HomepageGame }>> {
    return apiGet(API_ENDPOINTS.games.detail(id), { requireAuth: false })
  }

  /**
   * 创建新游戏（需要 admin 权限）
   */
  static async createGame(gameData: {
    name: string
    coverUrl: string
    price: string
    badge?: string | null
    discount?: string | null
    order?: number
  }): Promise<ApiResponse<{ game: HomepageGame }>> {
    return apiPost(API_ENDPOINTS.games.create, gameData, { requireAuth: true })
  }

  /**
   * 更新游戏信息（需要 admin 权限）
   */
  static async updateGame(
    id: string,
    gameData: Partial<{
      name: string
      coverUrl: string
      price: string
      badge: string | null
      discount: string | null
      order: number
    }>
  ): Promise<ApiResponse<{ game: HomepageGame }>> {
    return apiPut(API_ENDPOINTS.games.update(id), gameData, { requireAuth: true })
  }

  /**
   * 删除游戏（需要 admin 权限）
   */
  static async deleteGame(id: string): Promise<ApiResponse<void>> {
    return apiDelete(API_ENDPOINTS.games.delete(id), { requireAuth: true })
  }

  /**
   * 上传游戏封面图片（需要 admin 权限）
   */
  static async uploadCoverImage(file: File): Promise<ApiResponse<ImageUploadResponse>> {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: '請選擇圖片檔案',
      }
    }

    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: '圖片大小不能超過 5MB',
      }
    }

    return apiUpload(API_ENDPOINTS.games.uploadCover, file, { requireAuth: true })
  }

  /**
   * 批量更新游戏排序
   */
  static async updateGamesOrder(
    updates: Array<{ id: string; order: number }>
  ): Promise<ApiResponse<void>> {
    const results = await Promise.all(
      updates.map((update) =>
        this.updateGame(update.id, { order: update.order })
      )
    )

    const failed = results.filter((r) => !r.success)
    if (failed.length > 0) {
      return {
        success: false,
        error: `${failed.length} 個游戲更新失敗`,
      }
    }

    return {
      success: true,
    }
  }
}

// 导出默认实例
export const gamesService = GamesService
