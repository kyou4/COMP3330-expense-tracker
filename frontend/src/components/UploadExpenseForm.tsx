import { useState } from 'react'

interface UploadExpenseFormProps {
  expenseId: number
  onUploadSuccess?: () => void
}

export const UploadExpenseForm = ({ expenseId, onUploadSuccess }: UploadExpenseFormProps) => {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file to upload.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 1. Request signed upload URL from backend
      const { uploadUrl, key } = await fetch('/api/upload/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ filename: file.name, type: file.type }),
      }).then((res) => {
        if (!res.ok) throw new Error('Failed to get upload URL')
        return res.json()
      })

      // 2. Upload the file to S3
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      if (!uploadRes.ok) throw new Error('File upload failed')

      // 3. Update the expense with the fileKey
      const updateRes = await fetch(`/api/expenses/${expenseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fileKey: key }),
      })
      if (!updateRes.ok) {
        const data = await updateRes.json()
        throw new Error(data.error || 'Failed to update expense with file')
      }

      // 4. Success
      setFile(null)
      onUploadSuccess?.()
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={handleFileChange} />
      <button type="submit" disabled={loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  )
}
