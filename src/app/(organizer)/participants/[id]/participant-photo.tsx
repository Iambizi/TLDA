'use client'

import { useState, useRef } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../../../convex/_generated/api'
import type { Id } from '../../../../../convex/_generated/dataModel'

export function ParticipantPhoto({ 
  participantId, 
  initialName, 
  photoUrl 
}: { 
  participantId: Id<'participants'>
  initialName: string
  photoUrl?: string | null 
}) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateUploadUrl = useMutation(api.storage.generateUploadUrl)
  const updatePhoto = useMutation(api.participants.updatePhoto)

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // 1. Get a short-lived upload URL
      const postUrl = await generateUploadUrl()

      // 2. POST the file to the URL
      const result = await fetch(postUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      const { storageId } = await result.json()

      // 3. Save the storage ID to the participant
      await updatePhoto({ id: participantId, photo_storage_id: storageId })
    } catch (error) {
      console.error('Failed to upload photo:', error)
      alert('Failed to upload photo. Please try again.')
    } finally {
      setIsUploading(false)
      // Reset input so the same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="mt-5 flex items-center gap-4 rounded-xl border p-4 relative" style={{ borderColor: 'var(--border)', background: 'var(--neutral-50)' }}>
      {/* Hidden file input */}
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        disabled={isUploading}
      />
      
      {/* Avatar / Photo Display */}
      <div 
        className="flex h-16 w-16 overflow-hidden items-center justify-center rounded-full text-xl font-semibold relative flex-shrink-0" 
        style={{ background: 'var(--neutral-200)', color: 'var(--neutral-600)' }}
      >
        {photoUrl ? (
          <img src={photoUrl} alt={initialName} className="object-cover w-full h-full" />
        ) : (
          String(initialName || '?').slice(0, 1).toUpperCase()
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Info & Action */}
      <div className="flex-1">
        <p className="text-sm font-medium" style={{ color: 'var(--neutral-900)' }}>Participant photo</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
          {photoUrl ? 'Click below to change the photo.' : 'No photo uploaded yet.'}
        </p>
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="mt-2 text-xs font-medium px-3 py-1.5 rounded-lg border hover:bg-black/5 transition-colors disabled:opacity-50"
          style={{ borderColor: 'var(--border)', color: 'var(--neutral-900)' }}
        >
          {isUploading ? 'Uploading...' : photoUrl ? 'Change Photo' : 'Upload Photo'}
        </button>
      </div>
    </div>
  )
}
