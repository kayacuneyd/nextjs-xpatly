'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface ApproveRejectButtonsProps {
  listingId: string
}

export function ApproveRejectButtons({ listingId }: ApproveRejectButtonsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  const handleApprove = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/listings/${listingId}/approve`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to approve listing')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve listing')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/listings/${listingId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectionReason }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to reject listing')
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject listing')
    } finally {
      setLoading(false)
    }
  }

  if (showRejectForm) {
    return (
      <div className="space-y-3">
        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="Please provide a reason for rejection (will be shown to the user)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]"
          disabled={loading}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <div className="flex gap-2">
          <Button
            onClick={handleReject}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {loading ? 'Rejecting...' : 'Confirm Rejection'}
          </Button>
          <Button
            onClick={() => {
              setShowRejectForm(false)
              setRejectionReason('')
              setError(null)
            }}
            disabled={loading}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <div className="flex gap-3">
        <Button
          onClick={handleApprove}
          disabled={loading}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
        >
          {loading ? 'Approving...' : '✅ Approve'}
        </Button>
        <Button
          onClick={() => setShowRejectForm(true)}
          disabled={loading}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold"
        >
          ❌ Reject
        </Button>
      </div>
    </div>
  )
}
