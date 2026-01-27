
import { createClient } from '@supabase/supabase-js';

// Helper to validate URL format
const isValidUrl = (urlString: string | undefined): boolean => {
    if (!urlString) return false;
    try { 
        const url = new URL(urlString); 
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (e) { 
        return false; 
    }
};

// Access environment variables safely (bypass TS check if vite-env.d.ts is not picked up yet)
const env = (import.meta as any).env || {};

const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;

if (!isValidUrl(SUPABASE_URL) || !SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase credentials missing! Please check your .env file.');
}

// Initialize Client
// Use fallback only to prevent crash during initial load if env is missing
export const supabase = createClient(
    SUPABASE_URL || 'https://placeholder-url.supabase.co', 
    SUPABASE_ANON_KEY || 'placeholder-key'
) as any;

// --- Storage Utilities ---

const BUCKET_NAME = 'toast_master_assets';

export const uploadImage = async (file: File | Blob, folder: string = 'general'): Promise<string | null> => {
    try {
        const fileExt = file instanceof File ? file.name.split('.').pop() : 'jpg';
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return null;
        }

        const { data } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);

        return data.publicUrl;
    } catch (error) {
        console.error('Storage error:', error);
        return null;
    }
};

export const base64ToBlob = async (base64: string): Promise<Blob> => {
    const res = await fetch(base64);
    return await res.blob();
};
