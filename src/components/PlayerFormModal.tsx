import { useRef, useState, type FormEvent } from 'react'
import Modal from './Modal'
import { uploadPlayerImage } from '../lib/api'

interface Props {
  title: string
  submitLabel: string
  initialName?: string
  initialImageUrl?: string | null
  onClose: () => void
  onSubmit: (values: { name: string; imageUrl: string | null }) => Promise<void>
}

export default function PlayerFormModal({
  title,
  submitLabel,
  initialName = '',
  initialImageUrl = null,
  onClose,
  onSubmit,
}: Props) {
  const [name, setName] = useState(initialName)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(initialImageUrl)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  function handleFile(f: File | null) {
    setFile(f)
    if (f) setPreview(URL.createObjectURL(f))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      const imageUrl = file ? await uploadPlayerImage(file) : initialImageUrl
      await onSubmit({ name: name.trim(), imageUrl })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save player')
      setSaving(false)
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}
          >
            {preview ? (
              <img className="avatar" src={preview} alt="preview" style={{ width: 84, height: 84 }} />
            ) : (
              <div className="avatar" style={{ width: 84, height: 84, fontSize: '1.6rem' }}>
                📷
              </div>
            )}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div className="field">
          <label htmlFor="pname">Player name</label>
          <input id="pname" type="text" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        {error && (
          <p className="error-text" style={{ marginBottom: 12 }}>
            {error}
          </p>
        )}
        <button className="btn btn-primary btn-block" type="submit" disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </button>
      </form>
    </Modal>
  )
}
