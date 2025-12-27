import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const supabaseStorage = {
  async uploadFile(file: File, path: string): Promise<string> {
    // Si Supabase no está configurado, usar blob URL temporal
    if (!supabase) {
      console.warn('Supabase not configured, using temporary blob URL');
      return URL.createObjectURL(file);
    }

    try {
      // Subir a Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${path}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('ghost-audio')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Supabase upload error:', error);
        // Fallback a blob URL
        return URL.createObjectURL(file);
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('ghost-audio')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading to Supabase:', error);
      // Fallback a blob URL
      return URL.createObjectURL(file);
    }
  },
  
  async uploadAudio(file: File, path: string): Promise<string> {
    return this.uploadFile(file, path);
  },
  
  async getFileUrl(path: string): Promise<string> {
    if (!supabase) return path;
    
    const { data: { publicUrl } } = supabase.storage
      .from('ghost-audio')
      .getPublicUrl(path);
    
    return publicUrl;
  },
  
  async deleteFile(path: string): Promise<void> {
    if (!supabase) return;
    
    try {
      await supabase.storage
        .from('ghost-audio')
        .remove([path]);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  },
};
