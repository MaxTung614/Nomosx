/**
 * Shared CORS configuration for all Edge Functions
 * 
 * This file provides standardized CORS headers that should be used
 * across all Edge Functions to ensure consistent cross-origin behavior.
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Max-Age': '86400', // 24 hours
  'Access-Control-Expose-Headers': 'Content-Length, Content-Type',
}

/**
 * Creates a standardized CORS preflight response
 * Use this for handling OPTIONS requests
 */
export function createCorsPreflightResponse(): Response {
  return new Response('ok', {
    status: 200,
    headers: corsHeaders,
  })
}

/**
 * Creates a JSON response with CORS headers
 * @param data - The data to return as JSON
 * @param status - HTTP status code (default: 200)
 */
export function createCorsJsonResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

/**
 * Creates an error response with CORS headers
 * @param message - Error message
 * @param status - HTTP status code (default: 400)
 */
export function createCorsErrorResponse(message: string, status: number = 400): Response {
  return new Response(
    JSON.stringify({ 
      error: message,
      status,
      timestamp: new Date().toISOString(),
    }), 
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    }
  )
}
