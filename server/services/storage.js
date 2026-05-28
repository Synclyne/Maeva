/**
 * Supabase Storage helper — uploads file buffers from multer memoryStorage
 * and returns the public URL.
 *
 * Requires env vars:
 *   SUPABASE_URL          e.g. https://pmyzbtfpgskfdtejpedq.supabase.co
 *   SUPABASE_SERVICE_KEY  service_role JWT from Supabase dashboard → Settings → API
 */
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

let _client = null;

function getClient() {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) {
    console.warn('[storage] SUPABASE_URL / SUPABASE_SERVICE_KEY not set — file uploads disabled');
    return null;
  }
  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}

/**
 * Upload a multer file object (with .buffer and .originalname) to a bucket.
 * Returns the public URL, or a placeholder string on failure.
 */
async function uploadToStorage(bucket, file) {
  const client = getClient();
  if (!client) return '/uploads/placeholder.jpg';

  const ext      = path.extname(file.originalname).toLowerCase() || '.jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

  const { error } = await client.storage
    .from(bucket)
    .upload(filename, file.buffer, {
      contentType: file.mimetype || 'image/jpeg',
      upsert: false,
    });

  if (error) {
    console.error('[storage] upload error:', error.message);
    return '/uploads/placeholder.jpg';
  }

  const { data } = client.storage.from(bucket).getPublicUrl(filename);
  return data.publicUrl;
}

/**
 * Delete a file from storage given its full public URL.
 * Silently ignores errors.
 */
async function deleteFromStorage(bucket, publicUrl) {
  const client = getClient();
  if (!client || !publicUrl) return;

  try {
    const url      = process.env.SUPABASE_URL;
    const prefix   = `${url}/storage/v1/object/public/${bucket}/`;
    const filename = publicUrl.startsWith(prefix) ? publicUrl.slice(prefix.length) : null;
    if (!filename) return;
    await client.storage.from(bucket).remove([filename]);
  } catch (e) {
    console.error('[storage] delete error:', e.message);
  }
}

module.exports = { uploadToStorage, deleteFromStorage };
