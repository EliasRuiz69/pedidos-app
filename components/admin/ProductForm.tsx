'use client'

import { useEffect, useRef, useState } from 'react'
import { uploadProductImage } from '@/lib/storage'
import type { Product } from '@/types'

type ProductFormData = Omit<Product, 'id'>

type ProductFormProps = {
  initialValues?: ProductFormData
  onSubmit: (data: ProductFormData) => Promise<void>
  loading: boolean
  error: string
  submitLabel: string
}

const EMPTY: ProductFormData = { name: '', description: '', price: 0, image_url: '' }

export default function ProductForm({
  initialValues = EMPTY,
  onSubmit,
  loading,
  error,
  submitLabel,
}: ProductFormProps) {
  const [name, setName] = useState(initialValues.name)
  const [description, setDescription] = useState(initialValues.description)
  const [price, setPrice] = useState(initialValues.price.toString())
  const [imageUrl, setImageUrl] = useState(initialValues.image_url)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => { if (localPreview) URL.revokeObjectURL(localPreview) }
  }, [localPreview])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (localPreview) URL.revokeObjectURL(localPreview)
    setSelectedFile(file)
    setLocalPreview(URL.createObjectURL(file))
    setUploadError('')
  }

  function handleRemoveFile() {
    if (localPreview) URL.revokeObjectURL(localPreview)
    setSelectedFile(null)
    setLocalPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setUploadError('')
    let finalImageUrl = imageUrl

    if (selectedFile) {
      setUploading(true)
      const { url, error: uploadErr } = await uploadProductImage(selectedFile)
      setUploading(false)
      if (uploadErr || !url) { setUploadError(uploadErr ?? 'Error al subir imagen'); return }
      finalImageUrl = url
      setImageUrl(url)
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      image_url: finalImageUrl.trim(),
    })
  }

  const previewSrc = localPreview ?? (imageUrl || null)
  const isSubmitting = uploading || loading

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Nombre</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del producto"
          className="input-dark"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Descripción</label>
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción del producto"
          rows={3}
          className="input-dark resize-none"
        />
      </div>

      {/* Price */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Precio</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-600">$</span>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className="input-dark pl-7"
          />
        </div>
      </div>

      {/* Image */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Imagen</label>

        {/* Preview */}
        {previewSrc && (
          <div className="relative w-fit">
            <img
              src={previewSrc}
              alt="Vista previa"
              className="h-36 w-36 rounded-xl object-cover border border-neutral-700"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            {localPreview && (
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-700 text-neutral-300 text-xs hover:bg-neutral-600 transition-colors"
                title="Quitar imagen"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* File upload area */}
        <div className="flex items-center gap-3">
          <label className="cursor-pointer flex items-center gap-2 rounded-xl border border-dashed border-neutral-700 px-4 py-2.5 text-sm text-neutral-500 hover:border-neutral-500 hover:text-neutral-300 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {selectedFile ? selectedFile.name : 'Seleccionar archivo'}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>
          {selectedFile && (
            <span className="text-xs text-neutral-600">
              {(selectedFile.size / 1024).toFixed(0)} KB
            </span>
          )}
        </div>

        {/* URL fallback */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-neutral-700">O pega una URL de imagen</span>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => { setImageUrl(e.target.value); handleRemoveFile() }}
            placeholder="https://..."
            className="input-dark"
          />
        </div>

        {uploadError && (
          <div className="rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-400">
            {uploadError}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-900/40 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {uploading ? 'Subiendo imagen...' : 'Guardando...'}
          </span>
        ) : submitLabel}
      </button>
    </form>
  )
}
