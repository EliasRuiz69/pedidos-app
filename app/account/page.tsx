'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabaseClient'
import { getProfile, saveProfile, deleteProfile } from '@/lib/profile'
import type { Profile } from '@/types'

export default function AccountPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [profileLoading, setProfileLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [error, setError] = useState('')
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/login'); return }
    async function loadProfile() {
      try {
        const profile = await getProfile(user!.id)
        if (profile) { setName(profile.name); setPhone(profile.phone); setAddress(profile.address) }
      } catch {
        setError('Error al cargar el perfil')
      } finally {
        setProfileLoading(false)
      }
    }
    loadProfile()
  }, [user, authLoading, router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSuccessMsg(''); setSaving(true)
    try {
      if (!user) throw new Error('Sesión no encontrada')
      const { error: saveError } = await saveProfile(user.id, { email: user.email ?? '', name, phone, address })
      if (saveError) throw new Error(saveError)
      setSuccessMsg('Perfil actualizado correctamente')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError(''); setPasswordSuccess('')
    if (newPassword.length < 6) { setPasswordError('La contraseña debe tener al menos 6 caracteres'); return }
    if (newPassword !== confirmPassword) { setPasswordError('Las contraseñas no coinciden'); return }
    setPasswordLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
      if (updateError) throw updateError
      setPasswordSuccess('Contraseña actualizada correctamente')
      setNewPassword(''); setConfirmPassword(''); setShowPasswordForm(false)
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'Error al cambiar la contraseña')
    } finally {
      setPasswordLoading(false)
    }
  }

  async function handleDelete() {
    setError(''); setDeleting(true)
    try {
      if (!user) throw new Error('Sesión no encontrada')
      const { error: deleteError } = await deleteProfile(user.id)
      if (deleteError) throw new Error(deleteError)
      router.push('/'); router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al eliminar perfil')
      setDeleting(false); setShowConfirm(false)
    }
  }

  if (authLoading || profileLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="mb-8 flex gap-4">
          <div className="skeleton h-10 w-10 rounded-xl" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="skeleton h-5 w-32" />
            <div className="skeleton h-3 w-48" />
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="skeleton h-3 w-24" />
              <div className="skeleton h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-50 tracking-tight">Mi perfil</h1>
          <p className="mt-1 text-sm text-neutral-600">{user?.email}</p>
        </div>
        <Link
          href="/account/orders"
          className="flex items-center gap-1.5 rounded-xl border border-neutral-800 px-3 py-2 text-sm font-medium text-neutral-400 hover:border-neutral-700 hover:text-neutral-50 transition-all"
        >
          Mis pedidos
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Profile form */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Nombre completo</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Juan Pérez" className="input-dark" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Teléfono</label>
            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+52 555 000 0000" className="input-dark" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Dirección de entrega</label>
            <textarea required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle, número, colonia, ciudad" rows={3} className="input-dark resize-none" />
          </div>

          {error && <div className="rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-400">{error}</div>}
          {successMsg && <div className="rounded-xl border border-green-800/40 bg-green-950/30 px-4 py-3 text-sm text-green-400">{successMsg}</div>}

          <button type="submit" disabled={saving} className="btn-primary mt-1">
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Guardando...
              </span>
            ) : 'Guardar cambios'}
          </button>
        </form>
      </div>

      {/* Password section */}
      <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-neutral-300">Contraseña</h2>
            <p className="text-xs text-neutral-600 mt-0.5">Cambia tu contraseña de acceso</p>
          </div>
          <button
            type="button"
            onClick={() => { setShowPasswordForm(!showPasswordForm); setPasswordError(''); setPasswordSuccess('') }}
            className="text-xs font-medium text-orange-400 hover:text-orange-300 transition-colors"
          >
            {showPasswordForm ? 'Cancelar' : 'Cambiar'}
          </button>
        </div>

        {passwordSuccess && !showPasswordForm && (
          <div className="mt-4 rounded-xl border border-green-800/40 bg-green-950/30 px-4 py-3 text-sm text-green-400">
            {passwordSuccess}
          </div>
        )}

        {showPasswordForm && (
          <form onSubmit={handlePasswordChange} className="mt-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Nueva contraseña</label>
              <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="input-dark" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Confirmar contraseña</label>
              <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite la nueva contraseña" className="input-dark" />
            </div>
            {passwordError && <div className="rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-400">{passwordError}</div>}
            <button type="submit" disabled={passwordLoading} className="btn-primary">
              {passwordLoading ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>
        )}
      </div>

      {/* Danger zone */}
      <div className="mt-4 rounded-2xl border border-red-900/30 bg-red-950/10 p-6">
        <h2 className="text-sm font-semibold text-red-400 mb-1">Zona de peligro</h2>
        <p className="text-xs text-neutral-600 mb-4">
          Eliminar tu perfil borra tus datos de entrega. Esta acción no se puede deshacer.
        </p>
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="rounded-xl border border-red-900/50 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-950/40 transition-colors min-h-[40px]"
          >
            Eliminar perfil
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-red-400">
              ¿Confirmas que quieres eliminar tu perfil?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-xl border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-400 hover:bg-neutral-800 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
