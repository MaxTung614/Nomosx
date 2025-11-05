// 文件名: supabase/functions/search-games/index.ts (修正版)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// 修正：直接在單一檔案中定義 CORS 標頭，避免依賴外部檔案
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')// 注意：這裡使用 SERVICE_ROLE_KEY
;
serve(async (req)=>{
  // 1. 處理 OPTIONS 預檢請求
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q');
    // 2. 驗證搜尋參數
    if (!query || query.trim() === '') {
      return new Response(JSON.stringify({
        error: 'Missing or empty search query (q)',
        success: false
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      });
    }
    // 3. 創建 Supabase Admin 客戶端
    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    // 4. 呼叫 PGroonga 儲存函數
    const { data: games, error } = await supabaseAdmin.rpc('search_games_pgroonga', {
      query_text: query
    });
    if (error) {
      console.error('RPC Query Error:', error);
      return new Response(JSON.stringify({
        error: `Database query failed: ${error.message}`,
        success: false
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      });
    }
    // 5. 成功返回結果
    return new Response(JSON.stringify({
      data: games,
      count: games.length,
      success: true
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({
      error: e.message,
      success: false
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    });
  }
});
