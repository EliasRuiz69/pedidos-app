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
        if (profile) {
          setName(profile.name)
          setPhone(profile.phone)
          setAddress(profile.address)
        }
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
    setError('')
    setSuccessMsg('')
    setSaving(true)
    try {
      if (!user) throw new Error('Sesión no encontrada')
      const { error: saveError } = await saveProfile(user.id, {
        email: user.email ?? '',
        name,
        phone,
        address,
      })
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
    setPasswordError('')
    setPasswordSuccess('')
    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden')
      return
    }
    setPasswordLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
      if (updateError) throw updateError
      setPasswordSuccess('Contraseña actualizada correctamente')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordForm(false)
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'Error al cambiar la contraseña')
    } finally {
      setPasswordLoading(false)
    }
  }

  async function handleDelete() {
    setError('')
    setDeleting(true)
    try {
      if (!user) throw new Error('Sesión no encontrada')
      const { error: deleteError } = await deleteProfile(user.id)
      if (deleteError) throw new Error(deleteError)
      router.push('/')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al eliminar perfil')
      setDeleting(false)
      setShowConfirm(false)
    }
  }

  if (authLoading || profileLoading) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <p className="text-sm text-gray-500">Cargando perfil...</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>
        <Link
          href="/account/orders"
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          Mis pedidos →
        </Link>
      </div>
      <p className="text-sm text-gray-500 mb-8">{user?.email}</p>

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Nombre completo</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Juan Pérez"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Teléfono</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+52 555 000 0000"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Dirección de entrega</label>
          <textarea
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Calle, número, colonia, ciudad"
            rows={3}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 transition-colors resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
        {successMsg && (
          <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{successMsg}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-all"
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      <div className="mt-8 border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-700">Contraseña</h2>
          <button
            type="button"
            onClick={() => { setShowPasswordForm(!showPasswordForm); setPasswordError(''); setPasswordSuccess('') }}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            {showPasswordForm ? 'Cancelar' : 'Cambiar contraseña'}
          </button>
        </div>

        {passwordSuccess && !showPasswordForm && (
          <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 mb-4">
            {passwordSuccess}
          </p>
        )}

        {showPasswordForm && (
          <form onSubmit={handlePasswordChange} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Nueva contraseña</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Confirmar contraseña</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la nueva contraseña"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 transition-colors"
              />
            </div>
            {passwordError && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{passwordError}</p>
            )}
            <button
              type="submit"
              disabled={passwordLoading}
              className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-all"
            >
              {passwordLoading ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>
        )}
      </div>

      <div className="mt-8 border-t pt-6">
        <h2 className="text-sm font-medium text-gray-700 mb-1">Zona de peligro</h2>
        <p className="text-xs text-gray-400 mb-4">
          Eliminar tu perfil borra tus datos de entrega. No se puede deshacer.
        </p>

        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            Eliminar perfil
          </button>
        ) : (
          <div className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              ¿Confirmas que quieres eliminar tu perfil?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
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
