import { supabase } from '@/lib/supabaseClient'
import type { Profile } from '@/types'

export async function getProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) return null
    return data as Profile
  } catch {
    return null
  }
}

export async function getCurrentUserProfile(): Promise<Profile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    return getProfile(user.id)
  } catch {
    return null
  }
}

export async function saveProfile(
  userId: string,
  data: Omit<Profile, 'id' | 'role'>
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...data }, { onConflict: 'id' })

    if (error) throw error
    return { error: null }
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Error al guardar perfil' }
  }
}

export async function deleteProfile(userId: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (error) throw error
    return { error: null }
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Error al eliminar perfil' }
  }
}

export function getDisplayName(profile: Profile | null, email?: string | null): string {
  if (profile?.name) return profile.name
  if (email) return email.split('@')[0]
  return 'Usuario'
}
