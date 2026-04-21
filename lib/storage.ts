import { supabase } from '@/lib/supabaseClient'

export async function uploadProductImage(
  file: File
): Promise<{ url: string | null; error: string | null }> {
  try {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filename, file, { cacheControl: '3600', upsert: false })

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('products').getPublicUrl(filename)
    return { url: data.publicUrl, error: null }
  } catch (err: unknown) {
    return { url: null, error: err instanceof Error ? err.message : 'Error al subir imagen' }
  }
}
