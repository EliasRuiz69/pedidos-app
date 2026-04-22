'use client'

import { useEffect, useRef, useState } from 'react'
import { uploadProductImage } from '@/lib/storage'
import type { Product, PromoPriceConfig, PromoQuantityConfig } from '@/types'

type ProductFormData = Omit<Product, 'id'>

type ProductFormProps = {
  initialValues?: ProductFormData
  onSubmit: (data: ProductFormData) => Promise<void>
  loading: boolean
  error: string
  submitLabel: string
}

const EMPTY: ProductFormData = {
  name: '',
  description: '',
  price: 0,
  image_url: '',
  is_promo: false,
  promo_type: null,
  promo_config: null,
}

type PromoUIType = 'none' | 'price' | 'quantity'
type QuantitySubtype = 'buy_x_pay_y' | 'percentage'

function derivePromoState(v: ProductFormData) {
  if (!v.is_promo || !v.promo_type) {
    return { promoType: 'none' as PromoUIType, promoPrice: '', quantitySubtype: 'buy_x_pay_y' as QuantitySubtype, buy: '3', pay: '2', minQuantity: '2', discount: '50' }
  }
  if (v.promo_type === 'price') {
    const cfg = v.promo_config as PromoPriceConfig | null
    return { promoType: 'price' as PromoUIType, promoPrice: cfg?.promo_price?.toString() ?? '', quantitySubtype: 'buy_x_pay_y' as QuantitySubtype, buy: '3', pay: '2', minQuantity: '2', discount: '50' }
  }
  const cfg = v.promo_config as PromoQuantityConfig | null
  if (cfg?.subtype === 'buy_x_pay_y') {
    return { promoType: 'quantity' as PromoUIType, promoPrice: '', quantitySubtype: 'buy_x_pay_y' as QuantitySubtype, buy: cfg.buy.toString(), pay: cfg.pay.toString(), minQuantity: '2', discount: '50' }
  }
  if (cfg?.subtype === 'percentage') {
    return { promoType: 'quantity' as PromoUIType, promoPrice: '', quantitySubtype: 'percentage' as QuantitySubtype, buy: '3', pay: '2', minQuantity: cfg.min_quantity.toString(), discount: cfg.discount.toString() }
  }
  return { promoType: 'none' as PromoUIType, promoPrice: '', quantitySubtype: 'buy_x_pay_y' as QuantitySubtype, buy: '3', pay: '2', minQuantity: '2', discount: '50' }
}

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

  const derived = derivePromoState(initialValues)
  const [promoType, setPromoType] = useState<PromoUIType>(derived.promoType)
  const [promoPrice, setPromoPrice] = useState(derived.promoPrice)
  const [quantitySubtype, setQuantitySubtype] = useState<QuantitySubtype>(derived.quantitySubtype)
  const [buy, setBuy] = useState(derived.buy)
  const [pay, setPay] = useState(derived.pay)
  const [minQuantity, setMinQuantity] = useState(derived.minQuantity)
  const [discount, setDiscount] = useState(derived.discount)

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

  function buildPromoFields(): Pick<ProductFormData, 'is_promo' | 'promo_type' | 'promo_config'> {
    if (promoType === 'none') return { is_promo: false, promo_type: null, promo_config: null }
    if (promoType === 'price') {
      return { is_promo: true, promo_type: 'price', promo_config: { promo_price: parseFloat(promoPrice) } }
    }
    if (quantitySubtype === 'buy_x_pay_y') {
      return { is_promo: true, promo_type: 'quantity', promo_config: { subtype: 'buy_x_pay_y', buy: parseInt(buy), pay: parseInt(pay) } }
    }
    return { is_promo: true, promo_type: 'quantity', promo_config: { subtype: 'percentage', min_quantity: parseInt(minQuantity), discount: parseFloat(discount) } }
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
      ...buildPromoFields(),
    })
  }

  const previewSrc = localPreview ?? (imageUrl || null)
  const isSubmitting = uploading || loading
  const discountPct =
    promoType === 'price' && promoPrice && price && parseFloat(promoPrice) < parseFloat(price)
      ? Math.round((1 - parseFloat(promoPrice) / parseFloat(price)) * 100)
      : null

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

      {/* Promotion */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Promoción</label>

        <select
          value={promoType}
          onChange={(e) => setPromoType(e.target.value as PromoUIType)}
          className="input-dark"
        >
          <option value="none">Sin promoción</option>
          <option value="price">Precio rebajado</option>
          <option value="quantity">Por cantidad</option>
        </select>

        {/* Price promo config */}
        {promoType === 'price' && (
          <div className="rounded-xl border border-orange-900/30 bg-orange-950/10 p-4 flex flex-col gap-3">
            <p className="text-xs text-neutral-500">Muestra precio tachado y precio rebajado en el catálogo.</p>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Precio promocional</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-600">$</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={promoPrice}
                  onChange={(e) => setPromoPrice(e.target.value)}
                  placeholder="0.00"
                  className="input-dark pl-7"
                />
              </div>
              {discountPct !== null && (
                <p className="text-xs text-orange-400">{discountPct}% de descuento · etiqueta: {discountPct}% OFF</p>
              )}
            </div>
          </div>
        )}

        {/* Quantity promo config */}
        {promoType === 'quantity' && (
          <div className="rounded-xl border border-orange-900/30 bg-orange-950/10 p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Tipo de promoción</label>
              <select
                value={quantitySubtype}
                onChange={(e) => setQuantitySubtype(e.target.value as QuantitySubtype)}
                className="input-dark"
              >
                <option value="buy_x_pay_y">Compra X lleva Y (ej. 3x2)</option>
                <option value="percentage">Descuento en unidad adicional (ej. 2° al 50%)</option>
              </select>
            </div>

            {quantitySubtype === 'buy_x_pay_y' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Compra (X)</label>
                    <input
                      type="number"
                      required
                      min="2"
                      value={buy}
                      onChange={(e) => setBuy(e.target.value)}
                      className="input-dark"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Paga (Y)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={pay}
                      onChange={(e) => setPay(e.target.value)}
                      className="input-dark"
                    />
                  </div>
                </div>
                {buy && pay && (
                  <p className="text-xs text-orange-400 -mt-1">
                    Etiqueta: {buy}x{pay} · Al llevar {buy} unidades, pagas solo {pay}
                  </p>
                )}
              </>
            )}

            {quantitySubtype === 'percentage' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-neutral-600">Cada N unidades</label>
                    <input
                      type="number"
                      required
                      min="2"
                      value={minQuantity}
                      onChange={(e) => setMinQuantity(e.target.value)}
                      className="input-dark"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wide text-neutral-600">% descuento</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="input-dark"
                    />
                  </div>
                </div>
                {minQuantity && discount && (
                  <p className="text-xs text-orange-400 -mt-1">
                    Etiqueta: {minQuantity}° al {discount}% · La {minQuantity}ª unidad de cada grupo con {discount}% descuento
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Image */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Imagen</label>

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
