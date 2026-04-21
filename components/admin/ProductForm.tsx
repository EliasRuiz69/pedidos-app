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

  // Revocar object URL al desmontar para liberar memoria
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
      if (uploadErr || !url) {
        setUploadError(uploadErr ?? 'Error al subir imagen')
        return
      }
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Nombre</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del producto"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Descripción</label>
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción del producto"
          rows={3}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 transition-colors resize-none"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Precio</label>
        <input
          type="number"
          required
          min="0"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 transition-colors"
        />
      </div>

      {/* Imagen */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Imagen</label>

        {/* Preview */}
        {previewSrc && (
          <div className="relative w-fit">
            <img
              src={previewSrc}
              alt="Vista previa"
              className="h-36 w-36 rounded-lg object-cover border border-gray-200"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            {localPreview && (
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-white text-xs hover:bg-gray-600 transition-colors"
                title="Quitar imagen seleccionada"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Upload area */}
        <div className="flex items-center gap-3">
          <label className="cursor-pointer rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-500 hover:border-gray-500 hover:text-gray-700 transition-colors">
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
            <span className="text-xs text-gray-400">
              {(selectedFile.size / 1024).toFixed(0)} KB
            </span>
          )}
        </div>

        {/* URL manual como alternativa */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-400">O pega una URL de imagen</span>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => { setImageUrl(e.target.value); handleRemoveFile() }}
            placeholder="https://..."
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900 transition-colors"
          />
        </div>

        {uploadError && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{uploadError}</p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-all"
      >
        {uploading ? 'Subiendo imagen...' : loading ? 'Guardando...' : submitLabel}
      </button>
    </form>
  )
}
