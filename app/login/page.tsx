'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { getProfile } from '@/lib/profile'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  async function handleResetPassword() {
    if (!email) { setError('Ingresa tu email primero'); return }
    setResetLoading(true)
    setError('')
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      })
      if (resetError) throw resetError
      setResetSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al enviar el correo')
    } finally {
      setResetLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No se pudo obtener el usuario')

      const profile = await getProfile(user.id)
      router.push(profile ? '/' : '/complete-profile')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Iniciar sesión</h1>
      <p className="text-sm text-gray-500 mb-8">Ingresa con tu cuenta para continuar</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Contraseña</label>
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={resetLoading}
              className="text-xs text-gray-500 hover:text-gray-900 underline underline-offset-2 disabled:opacity-50 transition-colors"
            >
              {resetLoading ? 'Enviando...' : '¿Olvidaste tu contraseña?'}
            </button>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 transition-colors"
          />
        </div>

        {resetSent && (
          <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">
            Correo enviado a {email}. Revisa tu bandeja de entrada.
          </p>
        )}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-all"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-500 text-center">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="font-medium text-gray-900 underline underline-offset-4">
          Regístrate
        </Link>
      </p>
    </div>
  )
}
