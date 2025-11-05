// ====================================================================================================
// 文件名: supabase/functions/server/index.tsx (最終單文件完整版)
// 描述: NomosX 核心 Edge Function - 整合所有業務邏輯的單一文件
// 最後更新: 2025-10-22
// ====================================================================================================

// ------------------------------------
// 1. 導入 (Imports)
// ------------------------------------
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import * as kv from "./kv_store.tsx";

// ------------------------------------
// 2. 環境變量與配置 (Environment Setup)
// ------------------------------------
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Supabase Admin Client (Service Role)
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// PayPal Configuration
const PAYPAL_MODE = Deno.env.get('PAYPAL_MODE') || 'sandbox';
const PAYPAL_API_BASE = PAYPAL_MODE === 'production' 
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// ------------------------------------
// 3. 核心工具函數 (Core Utility Functions)
// ------------------------------------

/**
 * Encrypts a password using AES-256-GCM
 * @param password - The plain text password to encrypt
 * @param encryptionKey - The encryption key (must be 32 bytes for AES-256)
 * @returns Object containing encrypted data, IV, and auth tag
 */
async function encryptPassword(password: string, encryptionKey: string): Promise<{
  encrypted: string;
  iv: string;
  authTag: string;
  algorithm: string;
}> {
  try {
    // Generate a random IV (Initialization Vector)
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for GCM
    
    // Convert key to proper format (hash it to ensure 32 bytes)
    const encoder = new TextEncoder();
    const keyData = encoder.encode(encryptionKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
    
    // Import key for AES-GCM
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      hashBuffer,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );
    
    // Encrypt the password
    const passwordData = encoder.encode(password);
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
          name: 'AES-GCM',
          iv: iv,
          tagLength: 128 // 128-bit auth tag
      },
      cryptoKey,
      passwordData
    );
    
    // The encrypted data includes the auth tag at the end (last 16 bytes)
    const encryptedArray = new Uint8Array(encryptedBuffer);
    const ciphertext = encryptedArray.slice(0, -16);
    const authTag = encryptedArray.slice(-16);
    
    // Convert to base64 for storage
    return {
      encrypted: btoa(String.fromCharCode(...ciphertext)),
      iv: btoa(String.fromCharCode(...iv)),
      authTag: btoa(String.fromCharCode(...authTag)),
      algorithm: 'AES-256-GCM'
    };
  } catch (error) {
    console.error('Password encryption error:', error);
    throw new Error('Failed to encrypt password');
  }
}

/**
 * Decrypts a password encrypted with AES-256-GCM
 * @param encryptedData - Object containing encrypted data, IV, and auth tag
 * @param encryptionKey - The encryption key used for encryption
 * @returns The decrypted password
 */
async function decryptPassword(
  encryptedData: { encrypted: string; iv: string; authTag: string },
  encryptionKey: string
): Promise<string> {
  try {
    // Convert from base64
    const ciphertext = Uint8Array.from(atob(encryptedData.encrypted), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(encryptedData.iv), c => c.charCodeAt(0));
    const authTag = Uint8Array.from(atob(encryptedData.authTag), c => c.charCodeAt(0));
    
    // Combine ciphertext and auth tag
    const encryptedBuffer = new Uint8Array([...ciphertext, ...authTag]);
    
    // Convert key to proper format
    const encoder = new TextEncoder();
    const keyData = encoder.encode(encryptionKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
    
    // Import key for AES-GCM
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      hashBuffer,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );
    
    // Decrypt the password
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128
      },
      cryptoKey,
      encryptedBuffer
    );
    
    // Convert decrypted buffer to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (error) {
    console.error('Password decryption error:', error);
    throw new Error('Failed to decrypt password');
  }
}

/**
 * Get PayPal Access Token for API calls
 */
async function getPayPalAccessToken() {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
  
  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }
  
  const auth = btoa(`${clientId}:${clientSecret}`);
  
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  
  if (!response.ok) {
    throw new Error('Failed to get PayPal access token');
  }
  
  const data = await response.json();
  return data.access_token;
}

// ------------------------------------
// 4. Hono 應用程式實例與中間件 (Hono App Instance & Middleware)
// ------------------------------------
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["authorization", "x-client-info", "apikey", "content-type", "x-requested-with"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    exposeHeaders: ["Content-Length", "Content-Type"],
    maxAge: 86400, // 24 hours
    credentials: false,
  }),
);

// ------------------------------------
// 5. 認證中間件 (Authentication Middleware)
// ------------------------------------

/**
 * Require basic authentication - checks for valid access token
 */
const requireAuth = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    return c.json({ error: 'No authorization token provided' }, 401);
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
  
  if (error || !user) {
    console.error('Authorization error:', error);
    return c.json({ error: 'Unauthorized' }, 401);
  }

  // Store user in context for use in route handlers
  c.set('user', user);
  await next();
};

/**
 * Require admin role - checks for admin access
 */
const requireAdmin = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    return c.json({ error: 'No authorization token provided' }, 401);
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
  
  if (error || !user) {
    console.error('Authorization error:', error);
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const userRole = user.user_metadata?.role || 'user';
  if (userRole !== 'admin') {
    return c.json({ error: 'Admin access required' }, 403);
  }

  c.set('user', user);
  await next();
};

/**
 * Require admin or CS role - checks for admin or customer service access
 */
const requireAdminOrCS = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    return c.json({ error: 'No authorization token provided' }, 401);
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
  
  if (error || !user) {
    console.error('Authorization error:', error);
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const userRole = user.user_metadata?.role || 'user';
  if (userRole !== 'admin' && userRole !== 'cs') {
    return c.json({ error: 'Admin or CS access required' }, 403);
  }

  c.set('user', user);
  await next();
};

// ------------------------------------
// 6. 基礎路由 (Basic Routes)
// ------------------------------------

// Health check endpoint
app.get("/make-server-04b375d8/health", (c) => {
  return c.json({ status: "ok" });
});

// ------------------------------------
// 7. 認證路由 (Authentication Routes)
// ------------------------------------

// User registration endpoint
app.post("/make-server-04b375d8/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, full_name } = body;

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    console.log(`Creating user account for: ${email}`);

    // Create user with admin client to auto-confirm email
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      user_metadata: { 
        full_name: full_name || '',
        role: 'user' // Default role
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('User creation error:', error);
      return c.json({ error: error.message }, 400);
    }

    console.log(`User created successfully: ${data.user?.id}`);

    return c.json({ 
      success: true, 
      user: {
        id: data.user?.id,
        email: data.user?.email,
        created_at: data.user?.created_at
      }
    });

  } catch (error) {
    console.error('Signup endpoint error:', error);
    return c.json({ error: "Internal server error during signup" }, 500);
  }
});

// Get current user profile
app.get("/make-server-04b375d8/auth/profile", requireAuth, async (c) => {
  try {
    const user = c.get('user');
    
    return c.json({
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Profile endpoint error:', error);
    return c.json({ error: "Internal server error during profile fetch" }, 500);
  }
});

// Update user role (admin only)
app.put("/make-server-04b375d8/auth/update-role", requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');
    const body = await c.req.json();
    const { user_id, role } = body;

    if (!user_id || !role) {
      return c.json({ error: "user_id and role are required" }, 400);
    }

    // Only admin can update roles
    const currentUserRole = currentUser.user_metadata?.role || 'user';
    if (currentUserRole !== 'admin') {
      return c.json({ error: "Only admin can update user roles" }, 403);
    }

    // Update user metadata
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      user_id,
      { user_metadata: { role: role } }
    );

    if (error) {
      console.error('Role update error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, user: data.user });

  } catch (error) {
    console.error('Update role endpoint error:', error);
    return c.json({ error: "Internal server error during role update" }, 500);
  }
});

// Get all users (admin only)
app.get("/make-server-04b375d8/auth/users", requireAuth, async (c) => {
  try {
    const currentUser = c.get('user');

    // Only admin can list users
    const currentUserRole = currentUser.user_metadata?.role || 'user';
    if (currentUserRole !== 'admin') {
      return c.json({ error: "Only admin can list users" }, 403);
    }

    // Fetch all users from Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error('List users error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ 
      users: data.users.map(user => ({
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at
      }))
    });

  } catch (error) {
    console.error('Users endpoint error:', error);
    return c.json({ error: "Internal server error during user listing" }, 500);
  }
});

// ------------------------------------
// 8. 遊戲管理路由 (Games Management Routes)
// ------------------------------------

// Get all games (public - for homepage)
app.get("/make-server-04b375d8/games", async (c) => {
  try {
    const gamesListData = await kv.get('games:list');
    const gamesList = gamesListData ? JSON.parse(gamesListData) : [];
    
    if (gamesList.length === 0) {
      return c.json({ games: [] });
    }
    
    // Fetch all game details
    const gameKeys = gamesList.map((id: string) => `game:${id}`);
    const gamesData = await kv.mget(gameKeys);
    
    const games = gamesData
      .map((data: string | null) => data ? JSON.parse(data) : null)
      .filter((game: any) => game !== null)
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    
    return c.json({ games });
  } catch (error) {
    console.error('Get games error:', error);
    return c.json({ error: 'Failed to fetch games' }, 500);
  }
});

// Get single game by ID (public)
app.get("/make-server-04b375d8/games/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const gameData = await kv.get(`game:${id}`);
    
    if (!gameData) {
      return c.json({ error: 'Game not found' }, 404);
    }
    
    const game = JSON.parse(gameData);
    return c.json({ game });
  } catch (error) {
    console.error('Get game error:', error);
    return c.json({ error: 'Failed to fetch game' }, 500);
  }
});

// Create new game (admin only)
app.post("/make-server-04b375d8/games", requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    const { name, coverUrl, price, badge, discount, order } = body;
    
    if (!name || !coverUrl || !price) {
      return c.json({ error: 'Name, coverUrl, and price are required' }, 400);
    }
    
    // Generate unique ID
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const game = {
      id,
      name,
      coverUrl,
      price,
      badge: badge || null,
      discount: discount || null,
      order: order || 0,
      createdAt: now,
      updatedAt: now
    };
    
    // Save game data
    await kv.set(`game:${id}`, JSON.stringify(game));
    
    // Update games list
    const gamesListData = await kv.get('games:list');
    const gamesList = gamesListData ? JSON.parse(gamesListData) : [];
    gamesList.push(id);
    await kv.set('games:list', JSON.stringify(gamesList));
    
    console.log(`Game created successfully: ${id}`);
    return c.json({ success: true, game });
  } catch (error) {
    console.error('Create game error:', error);
    return c.json({ error: 'Failed to create game' }, 500);
  }
});

// Update game (admin only)
app.put("/make-server-04b375d8/games/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    // Get existing game
    const existingData = await kv.get(`game:${id}`);
    if (!existingData) {
      return c.json({ error: 'Game not found' }, 404);
    }
    
    const existingGame = JSON.parse(existingData);
    
    // Update game data
    const updatedGame = {
      ...existingGame,
      ...body,
      id, // Ensure ID cannot be changed
      createdAt: existingGame.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`game:${id}`, JSON.stringify(updatedGame));
    
    console.log(`Game updated successfully: ${id}`);
    return c.json({ success: true, game: updatedGame });
  } catch (error) {
    console.error('Update game error:', error);
    return c.json({ error: 'Failed to update game' }, 500);
  }
});

// Delete game (admin only)
app.delete("/make-server-04b375d8/games/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    
    // Check if game exists
    const existingData = await kv.get(`game:${id}`);
    if (!existingData) {
      return c.json({ error: 'Game not found' }, 404);
    }
    
    // Delete game data
    await kv.del(`game:${id}`);
    
    // Update games list
    const gamesListData = await kv.get('games:list');
    const gamesList = gamesListData ? JSON.parse(gamesListData) : [];
    const updatedList = gamesList.filter((gameId: string) => gameId !== id);
    await kv.set('games:list', JSON.stringify(updatedList));
    
    console.log(`Game deleted successfully: ${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Delete game error:', error);
    return c.json({ error: 'Failed to delete game' }, 500);
  }
});

// Upload game cover image to Supabase Storage (admin only)
app.post("/make-server-04b375d8/games/upload-cover", requireAdmin, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      return c.json({ error: 'File must be an image' }, 400);
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return c.json({ error: 'File size must be less than 5MB' }, 400);
    }
    
    const bucketName = 'make-04b375d8-game-covers';
    
    // Create bucket if it doesn't exist
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      await supabaseAdmin.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 5242880 // 5MB
      });
      console.log(`Created storage bucket: ${bucketName}`);
    }
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `covers/${fileName}`;
    
    // Upload file
    const arrayBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, arrayBuffer, {
        contentType: file.type,
        upsert: false
      });
    
    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ error: 'Failed to upload file' }, 500);
    }
    
    // Get signed URL (valid for 1 year)
    const { data: urlData } = await supabaseAdmin.storage
      .from(bucketName)
      .createSignedUrl(filePath, 31536000); // 1 year in seconds
    
    if (!urlData?.signedUrl) {
      return c.json({ error: 'Failed to generate URL' }, 500);
    }
    
    console.log(`Image uploaded successfully: ${filePath}`);
    return c.json({ 
      success: true, 
      url: urlData.signedUrl,
      path: filePath 
    });
  } catch (error) {
    console.error('Upload cover error:', error);
    return c.json({ error: 'Failed to upload cover image' }, 500);
  }
});

// ------------------------------------
// 9. CMS 基礎設定路由 (CMS Basic Settings Routes)
// ------------------------------------

// Regions CRUD
app.get("/make-server-04b375d8/cms/regions", requireAdmin, async (c) => {
  try {
    const { data: regions, error } = await supabaseAdmin
      .from('regions')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Get regions error:', error);
      return c.json({ error: "Failed to fetch regions" }, 500);
    }
    
    return c.json({ regions: regions || [] });
  } catch (error) {
    console.error('Get regions error:', error);
    return c.json({ error: "Failed to fetch regions" }, 500);
  }
});

app.post("/make-server-04b375d8/cms/regions", requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    const { region_code, region_name } = body;

    if (!region_code || !region_name) {
      return c.json({ error: "region_code and region_name are required" }, 400);
    }

    const { data: region, error } = await supabaseAdmin
      .from('regions')
      .insert({
        region_code,
        region_name,
        is_archived: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Create region error:', error);
      return c.json({ error: "Failed to create region" }, 500);
    }
    
    return c.json({ region });
  } catch (error) {
    console.error('Create region error:', error);
    return c.json({ error: "Failed to create region" }, 500);
  }
});

app.put("/make-server-04b375d8/cms/regions/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { region_code, region_name } = body;

    if (!region_code || !region_name) {
      return c.json({ error: "region_code and region_name are required" }, 400);
    }

    const { data: region, error } = await supabaseAdmin
      .from('regions')
      .update({
        region_code,
        region_name
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Update region error:', error);
      return c.json({ error: "Failed to update region" }, 500);
    }
    
    return c.json({ region });
  } catch (error) {
    console.error('Update region error:', error);
    return c.json({ error: "Failed to update region" }, 500);
  }
});

app.delete("/make-server-04b375d8/cms/regions/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');

    const { error } = await supabaseAdmin
      .from('regions')
      .update({ is_archived: true })
      .eq('id', id);
    
    if (error) {
      console.error('Archive region error:', error);
      return c.json({ error: "Failed to archive region" }, 500);
    }
    
    return c.json({ success: true, message: "Region archived successfully" });
  } catch (error) {
    console.error('Archive region error:', error);
    return c.json({ error: "Failed to archive region" }, 500);
  }
});

// Platforms CRUD
app.get("/make-server-04b375d8/cms/platforms", requireAdmin, async (c) => {
  try {
    const { data: platforms, error } = await supabaseAdmin
      .from('platforms')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Get platforms error:', error);
      return c.json({ error: "Failed to fetch platforms" }, 500);
    }
    
    return c.json({ platforms: platforms || [] });
  } catch (error) {
    console.error('Get platforms error:', error);
    return c.json({ error: "Failed to fetch platforms" }, 500);
  }
});

app.post("/make-server-04b375d8/cms/platforms", requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    const { platform_code, platform_name } = body;

    if (!platform_code || !platform_name) {
      return c.json({ error: "platform_code and platform_name are required" }, 400);
    }

    const { data: platform, error } = await supabaseAdmin
      .from('platforms')
      .insert({
        platform_code,
        platform_name,
        is_archived: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Create platform error:', error);
      return c.json({ error: "Failed to create platform" }, 500);
    }
    
    return c.json({ platform });
  } catch (error) {
    console.error('Create platform error:', error);
    return c.json({ error: "Failed to create platform" }, 500);
  }
});

app.put("/make-server-04b375d8/cms/platforms/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { platform_code, platform_name } = body;

    if (!platform_code || !platform_name) {
      return c.json({ error: "platform_code and platform_name are required" }, 400);
    }

    const { data: platform, error } = await supabaseAdmin
      .from('platforms')
      .update({
        platform_code,
        platform_name
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Update platform error:', error);
      return c.json({ error: "Failed to update platform" }, 500);
    }
    
    return c.json({ platform });
  } catch (error) {
    console.error('Update platform error:', error);
    return c.json({ error: "Failed to update platform" }, 500);
  }
});

app.delete("/make-server-04b375d8/cms/platforms/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');

    const { error } = await supabaseAdmin
      .from('platforms')
      .update({ is_archived: true })
      .eq('id', id);
    
    if (error) {
      console.error('Archive platform error:', error);
      return c.json({ error: "Failed to archive platform" }, 500);
    }
    
    return c.json({ success: true, message: "Platform archived successfully" });
  } catch (error) {
    console.error('Archive platform error:', error);
    return c.json({ error: "Failed to archive platform" }, 500);
  }
});

// Display Tags CRUD
app.get("/make-server-04b375d8/cms/display-tags", requireAdmin, async (c) => {
  try {
    const { data: displayTags, error } = await supabaseAdmin
      .from('display_tags')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Get display tags error:', error);
      return c.json({ error: "Failed to fetch display tags" }, 500);
    }
    
    return c.json({ displayTags: displayTags || [] });
  } catch (error) {
    console.error('Get display tags error:', error);
    return c.json({ error: "Failed to fetch display tags" }, 500);
  }
});

app.post("/make-server-04b375d8/cms/display-tags", requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    const { tag_name, tag_color } = body;

    if (!tag_name) {
      return c.json({ error: "tag_name is required" }, 400);
    }

    const { data: tag, error } = await supabaseAdmin
      .from('display_tags')
      .insert({
        tag_name,
        tag_color: tag_color || '#000000',
        is_archived: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Create display tag error:', error);
      return c.json({ error: "Failed to create display tag" }, 500);
    }
    
    return c.json({ tag });
  } catch (error) {
    console.error('Create display tag error:', error);
    return c.json({ error: "Failed to create display tag" }, 500);
  }
});

app.put("/make-server-04b375d8/cms/display-tags/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { tag_name, tag_color } = body;

    if (!tag_name) {
      return c.json({ error: "tag_name is required" }, 400);
    }

    const { data: tag, error } = await supabaseAdmin
      .from('display_tags')
      .update({
        tag_name,
        tag_color: tag_color || '#000000'
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Update display tag error:', error);
      return c.json({ error: "Failed to update display tag" }, 500);
    }
    
    return c.json({ tag });
  } catch (error) {
    console.error('Update display tag error:', error);
    return c.json({ error: "Failed to update display tag" }, 500);
  }
});

app.delete("/make-server-04b375d8/cms/display-tags/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');

    const { error } = await supabaseAdmin
      .from('display_tags')
      .update({ is_archived: true })
      .eq('id', id);
    
    if (error) {
      console.error('Archive display tag error:', error);
      return c.json({ error: "Failed to archive display tag" }, 500);
    }
    
    return c.json({ success: true, message: "Display tag archived successfully" });
  } catch (error) {
    console.error('Archive display tag error:', error);
    return c.json({ error: "Failed to archive display tag" }, 500);
  }
});

// ------------------------------------
// 10. CMS 遊戲與面額路由 (CMS Games & Denominations Routes)
// ------------------------------------

// Games CRUD
app.get("/make-server-04b375d8/cms/games", requireAdmin, async (c) => {
  try {
    const { data: games, error } = await supabaseAdmin
      .from('games')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Get games error:', error);
      return c.json({ error: "Failed to fetch games" }, 500);
    }
    
    return c.json({ games: games || [] });
  } catch (error) {
    console.error('Get games error:', error);
    return c.json({ error: "Failed to fetch games" }, 500);
  }
});

app.post("/make-server-04b375d8/cms/games", requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    const { name, regions, platform, display_tag, image_url } = body;

    if (!name || !regions) {
      return c.json({ error: "name and regions are required" }, 400);
    }

    const { data: game, error } = await supabaseAdmin
      .from('games')
      .insert({
        name,
        regions,
        platform,
        display_tag,
        image_url,
        is_archived: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Create game error:', error);
      return c.json({ error: "Failed to create game" }, 500);
    }
    
    return c.json({ game });
  } catch (error) {
    console.error('Create game error:', error);
    return c.json({ error: "Failed to create game" }, 500);
  }
});

app.put("/make-server-04b375d8/cms/games/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { name, regions, platform, display_tag, image_url } = body;

    if (!name || !regions) {
      return c.json({ error: "name and regions are required" }, 400);
    }

    const { data: game, error } = await supabaseAdmin
      .from('games')
      .update({
        name,
        regions,
        platform,
        display_tag,
        image_url
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Update game error:', error);
      return c.json({ error: "Failed to update game" }, 500);
    }
    
    return c.json({ game });
  } catch (error) {
    console.error('Update game error:', error);
    return c.json({ error: "Failed to update game" }, 500);
  }
});

app.delete("/make-server-04b375d8/cms/games/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');

    const { error } = await supabaseAdmin
      .from('games')
      .update({ is_archived: true })
      .eq('id', id);
    
    if (error) {
      console.error('Archive game error:', error);
      return c.json({ error: "Failed to archive game" }, 500);
    }
    
    return c.json({ success: true, message: "Game archived successfully" });
  } catch (error) {
    console.error('Archive game error:', error);
    return c.json({ error: "Failed to archive game" }, 500);
  }
});

// Denominations CRUD
app.get("/make-server-04b375d8/cms/denominations", requireAdmin, async (c) => {
  try {
    const { data: denominations, error } = await supabaseAdmin
      .from('denominations')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Get denominations error:', error);
      return c.json({ error: "Failed to fetch denominations" }, 500);
    }
    
    return c.json({ denominations: denominations || [] });
  } catch (error) {
    console.error('Get denominations error:', error);
    return c.json({ error: "Failed to fetch denominations" }, 500);
  }
});

app.post("/make-server-04b375d8/cms/denominations", requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    const { game_id, sku_code, name, display_price, region_code, paypal_amount } = body;

    if (!game_id || !sku_code || !name || !display_price) {
      return c.json({ error: "game_id, sku_code, name, and display_price are required" }, 400);
    }

    const { data: denomination, error } = await supabaseAdmin
      .from('denominations')
      .insert({
        game_id,
        sku_code,
        name,
        display_price,
        region_code,
        paypal_amount: paypal_amount || null,
        is_archived: false
      })
      .select()
      .single();
    
    if (error) {
      console.error('Create denomination error:', error);
      return c.json({ error: "Failed to create denomination" }, 500);
    }
    
    return c.json({ denomination });
  } catch (error) {
    console.error('Create denomination error:', error);
    return c.json({ error: "Failed to create denomination" }, 500);
  }
});

app.put("/make-server-04b375d8/cms/denominations/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { game_id, sku_code, name, display_price, region_code, paypal_amount } = body;

    if (!game_id || !sku_code || !name || !display_price) {
      return c.json({ error: "game_id, sku_code, name, and display_price are required" }, 400);
    }

    const { data: denomination, error } = await supabaseAdmin
      .from('denominations')
      .update({
        game_id,
        sku_code,
        name,
        display_price,
        region_code,
        paypal_amount: paypal_amount || null
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Update denomination error:', error);
      return c.json({ error: "Failed to update denomination" }, 500);
    }
    
    return c.json({ denomination });
  } catch (error) {
    console.error('Update denomination error:', error);
    return c.json({ error: "Failed to update denomination" }, 500);
  }
});

app.delete("/make-server-04b375d8/cms/denominations/:id", requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');

    const { error } = await supabaseAdmin
      .from('denominations')
      .update({ is_archived: true })
      .eq('id', id);
    
    if (error) {
      console.error('Archive denomination error:', error);
      return c.json({ error: "Failed to archive denomination" }, 500);
    }
    
    return c.json({ success: true, message: "Denomination archived successfully" });
  } catch (error) {
    console.error('Archive denomination error:', error);
    return c.json({ error: "Failed to archive denomination" }, 500);
  }
});

// ------------------------------------
// 11. 公開產品 API (Public Product API)
// ------------------------------------

// Public API: Get products for customer-facing product page
app.get("/make-server-04b375d8/products", async (c) => {
  try {
    // Fetch all active games with their regions
    const { data: games, error: gamesError } = await supabaseAdmin
      .from('games')
      .select('*')
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (gamesError) {
      console.error('Fetch games error:', gamesError);
      return c.json({ error: "Failed to fetch games" }, 500);
    }

    // Fetch all active denominations
    const { data: denominations, error: denominationsError } = await supabaseAdmin
      .from('denominations')
      .select('*')
      .eq('is_archived', false);

    if (denominationsError) {
      console.error('Fetch denominations error:', denominationsError);
      return c.json({ error: "Failed to fetch denominations" }, 500);
    }

    // Fetch all regions
    const { data: regions, error: regionsError } = await supabaseAdmin
      .from('regions')
      .select('*')
      .eq('is_archived', false);

    if (regionsError) {
      console.error('Fetch regions error:', regionsError);
      return c.json({ error: "Failed to fetch regions" }, 500);
    }

    // Transform data for frontend
    const products = games.map(game => ({
      id: game.id,
      name: game.name,
      regions: game.regions,
      platform: game.platform,
      display_tag: game.display_tag,
      image_url: game.image_url,
      denominations: denominations.filter(d => d.game_id === game.id)
    }));

    return c.json({ 
      products,
      regions: regions || []
    });

  } catch (error) {
    console.error('Products endpoint error:', error);
    return c.json({ error: "Failed to fetch products" }, 500);
  }
});

// ------------------------------------
// 12. 訂單路由 (Order Routes)
// ------------------------------------

// EDGE FUNCTION 1: Submit Order with Password Encryption and Audit Logging
app.post("/make-server-04b375d8/orders", async (c) => {
  try {
    const body = await c.req.json();
    const { 
      denomination_id,
      quantity,
      customer_email,
      customer_line_id,
      game_login_account,
      game_login_password,
      additional_notes
    } = body;

    // Validation
    if (!denomination_id || !quantity || !customer_email || !game_login_account || !game_login_password) {
      return c.json({ 
        error: "Missing required fields: denomination_id, quantity, customer_email, game_login_account, game_login_password" 
      }, 400);
    }

    if (quantity < 1 || quantity > 100) {
      return c.json({ error: "Quantity must be between 1 and 100" }, 400);
    }

    // Fetch denomination details
    const { data: denomination, error: denomError } = await supabaseAdmin
      .from('denominations')
      .select('*')
      .eq('id', denomination_id)
      .single();

    if (denomError || !denomination) {
      console.error('Denomination fetch error:', denomError);
      return c.json({ error: "Invalid denomination_id" }, 400);
    }

    // Create order in database
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        denomination_id,
        quantity,
        customer_email,
        customer_line_id: customer_line_id || null,
        game_login_account,
        additional_notes: additional_notes || null,
        status: 'pending',
        payment_status: 'pending',
        fulfillment_status: 'pending'
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Order creation error:', orderError);
      return c.json({ error: "Failed to create order" }, 500);
    }

    // Encrypt password
    const encryptionKey = Deno.env.get('ORDER_ENCRYPTION_KEY') || 'default-encryption-key-change-in-production';
    const encryptedData = await encryptPassword(game_login_password, encryptionKey);

    // Store encrypted password in order_credentials table
    const { error: credentialError } = await supabaseAdmin
      .from('order_credentials')
      .insert({
        order_id: order.id,
        encrypted_password: JSON.stringify(encryptedData),
        encryption_metadata: {
          algorithm: encryptedData.algorithm,
          encrypted_at: new Date().toISOString(),
          key_version: '1'
        }
      });

    if (credentialError) {
      console.error('Credential storage error:', credentialError);
      // Continue even if credential storage fails - order is already created
    }

    // Create audit log
    const { error: auditError } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        action: 'order_created',
        resource_type: 'order',
        resource_id: order.id,
        user_id: null,
        metadata: {
          customer_email,
          denomination_id,
          quantity
        }
      });

    if (auditError) {
      console.error('Audit log error:', auditError);
      // Continue even if audit log fails
    }

    console.log(`Order created successfully: ${order.id}`);

    return c.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        payment_status: order.payment_status,
        created_at: order.created_at
      }
    });

  } catch (error) {
    console.error('Order submission error:', error);
    return c.json({ error: "Failed to submit order" }, 500);
  }
});

// Get order status (for payment flow)
app.get("/make-server-04b375d8/orders/:orderId", async (c) => {
  try {
    const orderId = c.req.param('orderId');

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        denominations(name, display_price, game_id, sku_code)
      `)
      .eq('id', orderId)
      .single();

    if (error || !order) {
      console.error('Order fetch error:', error);
      return c.json({ error: "Order not found" }, 404);
    }

    return c.json({ order });

  } catch (error) {
    console.error('Order status error:', error);
    return c.json({ error: "Failed to fetch order" }, 500);
  }
});

// EDGE FUNCTION 3: Fulfill Order - Complete order fulfillment process
app.post("/make-server-04b375d8/orders/:orderId/fulfill", requireAdminOrCS, async (c) => {
  try {
    const orderId = c.req.param('orderId');
    const user = c.get('user');
    const body = await c.req.json();
    const { fulfillment_notes } = body;

    console.log(`Attempting to fulfill order ${orderId} by user ${user.id}`);

    // Step 1: Fetch the order and check current status
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      console.error('Order fetch error:', fetchError);
      return c.json({ error: "Order not found" }, 404);
    }

    // Step 2: Validate order can be fulfilled
    if (order.fulfillment_status === 'fulfilled') {
      return c.json({ 
        error: "Order has already been fulfilled",
        order: order
      }, 400);
    }

    if (order.payment_status !== 'paid') {
      return c.json({ 
        error: "Order payment must be completed before fulfillment",
        order: order
      }, 400);
    }

    // Step 3: Update order status
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        fulfillment_status: 'fulfilled',
        fulfilled_at: new Date().toISOString(),
        fulfilled_by: user.id,
        fulfillment_notes: fulfillment_notes || null,
        status: 'completed'
      })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error('Order update error:', updateError);
      return c.json({ error: "Failed to update order" }, 500);
    }

    // Step 4: Create audit log
    const { error: auditError } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        action: 'order_fulfilled',
        resource_type: 'order',
        resource_id: orderId,
        user_id: user.id,
        metadata: {
          fulfillment_notes: fulfillment_notes || null,
          fulfilled_at: new Date().toISOString()
        }
      });

    if (auditError) {
      console.error('Audit log error:', auditError);
      // Continue even if audit log fails
    }

    console.log(`Order ${orderId} fulfilled successfully by ${user.id}`);

    return c.json({
      success: true,
      order: updatedOrder,
      message: 'Order fulfilled successfully'
    });

  } catch (error) {
    console.error('Order fulfillment error:', error);
    return c.json({ error: "Failed to fulfill order" }, 500);
  }
});

// Get all orders for Admin/CS (with pagination and filtering)
app.get("/make-server-04b375d8/admin/orders", requireAdminOrCS, async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '50');
    const status = c.req.query('status');
    const payment_status = c.req.query('payment_status');
    const fulfillment_status = c.req.query('fulfillment_status');
    
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        denominations(name, display_price, game_id, sku_code),
        fulfilled_by_user:fulfilled_by(email, raw_user_meta_data)
      `, { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (payment_status) query = query.eq('payment_status', payment_status);
    if (fulfillment_status) query = query.eq('fulfillment_status', fulfillment_status);

    const { data: orders, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get orders error:', error);
      return c.json({ error: "Failed to fetch orders" }, 500);
    }

    return c.json({
      orders: orders || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    return c.json({ error: "Failed to fetch orders" }, 500);
  }
});

// Get single order details for Admin/CS
app.get("/make-server-04b375d8/admin/orders/:orderId", requireAdminOrCS, async (c) => {
  try {
    const orderId = c.req.param('orderId');

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        denominations(name, display_price, game_id, sku_code),
        fulfilled_by_user:fulfilled_by(email, raw_user_meta_data)
      `)
      .eq('id', orderId)
      .single();

    if (error || !order) {
      console.error('Order fetch error:', error);
      return c.json({ error: "Order not found" }, 404);
    }

    return c.json({ order });

  } catch (error) {
    console.error('Order detail error:', error);
    return c.json({ error: "Failed to fetch order details" }, 500);
  }
});

// ------------------------------------
// 13. 支付處理路由 (Payment Processing Routes)
// ------------------------------------

// Process payment for an order
app.post("/make-server-04b375d8/payments/process", async (c) => {
  try {
    const body = await c.req.json();
    const { order_id, payment_method, payment_details } = body;

    if (!order_id || !payment_method) {
      return c.json({ error: "order_id and payment_method are required" }, 400);
    }

    // Fetch the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      console.error('Order fetch error:', orderError);
      return c.json({ error: "Order not found" }, 404);
    }

    // Check if payment already processed
    if (order.payment_status === 'paid') {
      return c.json({ 
        success: true,
        message: "Payment already processed",
        order: order
      });
    }

    // Create payment transaction record
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from('payment_transactions')
      .insert({
        order_id,
        gateway: payment_method,
        amount: payment_details?.amount || 0,
        currency: payment_details?.currency || 'USD',
        status: 'processing',
        gateway_transaction_id: payment_details?.transaction_id || null,
        gateway_response: payment_details || {}
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Transaction creation error:', transactionError);
      return c.json({ error: "Failed to create payment transaction" }, 500);
    }

    // Simulate payment processing (in real implementation, this would call payment gateway API)
    const paymentSuccessful = true; // Replace with actual payment gateway call

    if (paymentSuccessful) {
      // Update order payment status
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'paid',
          gateway_transaction_id: transaction.id,
          status: 'processing'
        })
        .eq('id', order_id);

      if (updateError) {
        console.error('Order update error:', updateError);
      }

      // Update transaction status
      await supabaseAdmin
        .from('payment_transactions')
        .update({ status: 'completed' })
        .eq('id', transaction.id);

      // Create audit log
      await supabaseAdmin
        .from('audit_logs')
        .insert({
          action: 'payment_completed',
          resource_type: 'order',
          resource_id: order_id,
          user_id: null,
          metadata: {
            payment_method,
            transaction_id: transaction.id,
            amount: payment_details?.amount
          }
        });

      return c.json({
        success: true,
        message: "Payment processed successfully",
        transaction_id: transaction.id,
        order_id: order_id
      });
    } else {
      // Payment failed
      await supabaseAdmin
        .from('payment_transactions')
        .update({ status: 'failed' })
        .eq('id', transaction.id);

      return c.json({
        success: false,
        error: "Payment processing failed",
        transaction_id: transaction.id
      }, 400);
    }

  } catch (error) {
    console.error('Payment processing error:', error);
    return c.json({ error: "Failed to process payment" }, 500);
  }
});

// Get payment history for admin (admin only)
app.get("/make-server-04b375d8/admin/payments", requireAdmin, async (c) => {
  try {
    // Get all orders with payment information
    const { data: transactions, error } = await supabaseAdmin
      .from('payment_transactions')
      .select(`
        *,
        orders(id, customer_email, status, created_at)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Get payment history error:', error);
      return c.json({ error: "Failed to fetch payment history" }, 500);
    }

    return c.json({ transactions: transactions || [] });

  } catch (error) {
    console.error('Payment history error:', error);
    return c.json({ error: "Failed to fetch payment history" }, 500);
  }
});

// Get order statistics for admin (admin only)
app.get("/make-server-04b375d8/admin/order-stats", requireAdmin, async (c) => {
  try {
    const orders = await kv.getByPrefix('order_');
    
    const stats = {
      total_orders: orders.length,
      pending_orders: orders.filter((o: any) => o.status === 'pending').length,
      processing_orders: orders.filter((o: any) => o.status === 'processing').length,
      completed_orders: orders.filter((o: any) => o.status === 'completed').length,
      failed_orders: orders.filter((o: any) => o.status === 'failed').length,
      total_revenue: orders
        .filter((o: any) => o.payment_status === 'paid')
        .reduce((sum: number, o: any) => {
          // Calculate revenue based on denomination price and quantity
          return sum + (o.total_amount || 0);
        }, 0),
      pending_fulfillment: orders.filter((o: any) => 
        o.payment_status === 'paid' && o.fulfillment_status === 'pending'
      ).length
    };

    return c.json({ stats });

  } catch (error) {
    console.error('Order stats error:', error);
    return c.json({ error: "Failed to fetch order statistics" }, 500);
  }
});

// ------------------------------------
// 14. PayPal 整合路由 (PayPal Integration Routes)
// ------------------------------------

// Create PayPal Order
app.post("/make-server-04b375d8/payments/paypal/create", async (c) => {
  try {
    const body = await c.req.json();
    const { order_id } = body;

    if (!order_id) {
      return c.json({ error: "order_id is required" }, 400);
    }

    // Fetch the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        denominations(name, display_price, paypal_amount)
      `)
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      console.error('Order fetch error:', orderError);
      return c.json({ error: "Order not found" }, 404);
    }
    
    // Check if already has a transaction ID (prevent duplicate)
    if (order.gateway_transaction_id) {
      return c.json({ 
        error: "Order already has a payment transaction" 
      }, 400);
    }
    
    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();
    
    // Calculate amount
    const denomination = order.denominations as any;
    const amount = denomination.paypal_amount || denomination.display_price;
    const totalAmount = (parseFloat(amount) * order.quantity).toFixed(2);
    
    const description = denomination 
      ? `${denomination.name}`
      : `Order ${order_id}`;
    
    // Create PayPal order
    const paypalOrder = {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: order_id,
        description: description,
        amount: {
          currency_code: 'USD',
          value: totalAmount
        }
      }],
      application_context: {
        return_url: `${Deno.env.get('FRONTEND_URL') || 'http://localhost:3000'}/payment/paypal/return?order_id=${order_id}`,
        cancel_url: `${Deno.env.get('FRONTEND_URL') || 'http://localhost:3000'}/payment/paypal/cancel?order_id=${order_id}`,
        brand_name: 'NomosX',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW'
      }
    };

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(paypalOrder),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('PayPal API error:', errorData);
      return c.json({ error: "Failed to create PayPal order" }, 500);
    }

    const paypalOrderData = await response.json();

    // Update order with PayPal order ID
    await supabaseAdmin
      .from('orders')
      .update({
        gateway_transaction_id: paypalOrderData.id,
        payment_gateway: 'paypal'
      })
      .eq('id', order_id);

    // Create payment transaction record
    await supabaseAdmin
      .from('payment_transactions')
      .insert({
        order_id,
        gateway: 'paypal',
        amount: parseFloat(totalAmount),
        currency: 'USD',
        status: 'pending',
        gateway_transaction_id: paypalOrderData.id,
        gateway_response: paypalOrderData
      });

    // Find approval URL
    const approvalUrl = paypalOrderData.links?.find((link: any) => link.rel === 'approve')?.href;

    return c.json({
      success: true,
      paypal_order_id: paypalOrderData.id,
      approval_url: approvalUrl,
      order_id: order_id
    });

  } catch (error) {
    console.error('PayPal order creation error:', error);
    return c.json({ error: "Failed to create PayPal order" }, 500);
  }
});

// Capture PayPal Payment (called after user approves)
app.post("/make-server-04b375d8/payments/paypal/capture", async (c) => {
  try {
    const body = await c.req.json();
    const { paypal_order_id, order_id } = body;

    if (!paypal_order_id || !order_id) {
      return c.json({ error: "paypal_order_id and order_id are required" }, 400);
    }

    // Fetch the order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      console.error('Order fetch error:', orderError);
      return c.json({ error: "Order not found" }, 404);
    }

    // Check if already processed
    if (order.payment_status === 'paid') {
      console.log(`Order ${order_id} already processed`);
      return c.json({ 
        success: true,
        message: "Payment already processed",
        order_id: order_id
      });
    }
    
    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();
    
    // Capture the payment
    const response = await fetch(
      `${PAYPAL_API_BASE}/v2/checkout/orders/${paypal_order_id}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('PayPal capture error:', errorData);
      return c.json({ error: "Failed to capture PayPal payment" }, 500);
    }

    const captureData = await response.json();

    // Check capture status
    if (captureData.status === 'COMPLETED') {
      // Update order payment status
      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'processing'
        })
        .eq('id', order_id);

      // Update payment transaction
      await supabaseAdmin
        .from('payment_transactions')
        .update({
          status: 'completed',
          gateway_response: captureData
        })
        .eq('gateway_transaction_id', paypal_order_id);

      // Create audit log
      await supabaseAdmin
        .from('audit_logs')
        .insert({
          action: 'payment_captured',
          resource_type: 'order',
          resource_id: order_id,
          user_id: null,
          metadata: {
            paypal_order_id,
            capture_status: captureData.status
          }
        });

      return c.json({
        success: true,
        message: "Payment captured successfully",
        order_id: order_id,
        paypal_order_id: paypal_order_id
      });
    } else {
      return c.json({
        success: false,
        error: "Payment capture incomplete",
        status: captureData.status
      }, 400);
    }

  } catch (error) {
    console.error('PayPal capture error:', error);
    return c.json({ error: "Failed to capture PayPal payment" }, 500);
  }
});

// PayPal Webhook Handler
app.post("/make-server-04b375d8/webhooks/paypal", async (c) => {
  try {
    const webhookBody = await c.req.text();
    const webhookEvent = JSON.parse(webhookBody);
    
    console.log('PayPal Webhook received:', webhookEvent.event_type);
    
    // Verify webhook signature
    const webhookId = Deno.env.get('PAYPAL_WEBHOOK_ID');
    
    if (webhookId) {
      const accessToken = await getPayPalAccessToken();
      
      const verifyData = {
        transmission_id: c.req.header('paypal-transmission-id'),
        transmission_time: c.req.header('paypal-transmission-time'),
        cert_url: c.req.header('paypal-cert-url'),
        auth_algo: c.req.header('paypal-auth-algo'),
        transmission_sig: c.req.header('paypal-transmission-sig'),
        webhook_id: webhookId,
        webhook_event: webhookEvent
      };

      const verifyResponse = await fetch(
        `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(verifyData),
        }
      );

      const verifyResult = await verifyResponse.json();
      
      if (verifyResult.verification_status !== 'SUCCESS') {
        console.error('Webhook verification failed');
        return c.json({ error: "Webhook verification failed" }, 401);
      }
    }

    // Process webhook based on event type
    switch (webhookEvent.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        // Payment was captured successfully
        const resourceId = webhookEvent.resource?.id;
        
        // Find order by transaction ID
        const { data: transaction } = await supabaseAdmin
          .from('payment_transactions')
          .select('order_id')
          .eq('gateway_transaction_id', resourceId)
          .single();

        if (transaction) {
          await supabaseAdmin
            .from('orders')
            .update({ payment_status: 'paid' })
            .eq('id', transaction.order_id);
        }
        break;

      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.REFUNDED':
        // Handle payment denial or refund
        console.log('Payment issue:', webhookEvent.event_type);
        break;

      default:
        console.log('Unhandled webhook event:', webhookEvent.event_type);
    }

    return c.json({ received: true });

  } catch (error) {
    console.error('PayPal webhook error:', error);
    return c.json({ error: "Webhook processing failed" }, 500);
  }
});

// ------------------------------------
// 15. ECPay 整合路由 (ECPay Integration Routes - Placeholder)
// ------------------------------------

// Create ECPay Payment (Placeholder)
app.post("/make-server-04b375d8/payments/ecpay/create", async (c) => {
  // TODO: Implement ECPay order creation logic here
  // 
  // This endpoint should:
  // 1. Fetch order details
  // 2. Calculate total amount
  // 3. Create ECPay payment form
  // 4. Return form data or redirect URL
  
  return c.json({
    error: "ECPay integration not yet implemented",
    message: "This feature is planned for future implementation (Phase 4.2)"
  }, 501);
});

// ECPay Return URL Handler (Placeholder)
app.post("/make-server-04b375d8/webhooks/ecpay", async (c) => {
  // TODO: Implement ECPay webhook/return URL handler
  //
  // This endpoint should:
  // 1. Verify ECPay callback signature
  // 2. Update order payment status
  // 3. Create payment transaction record
  // 4. Send confirmation response to ECPay
  
  return c.json({
    error: "ECPay webhook handler not yet implemented"
  }, 501);
});

// ECPay Client Return URL Handler (Placeholder)
app.get("/make-server-04b375d8/payments/ecpay/return", async (c) => {
  // TODO: Implement ECPay client return URL handler
  //
  // This endpoint should handle user return from ECPay
  // and redirect to appropriate page with payment result
  
  return c.text("ECPay return handler not yet implemented", 501);
});

// ------------------------------------
// 16. 服務啟動 (Service Bootstrap)
// ------------------------------------

// Handle CORS preflight (OPTIONS) requests globally
Deno.serve(async (req) => {
  // Handle OPTIONS requests for CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Pass all other requests to Hono app
  return app.fetch(req);
});

// ====================================================================================================
// END OF FILE
// ====================================================================================================
