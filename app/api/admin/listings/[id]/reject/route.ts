import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role, is_banned')
      .eq('id', user.id)
      .single()

    if (
      !userData ||
      userData.is_banned ||
      (userData.role !== 'super_admin' && userData.role !== 'moderator')
    ) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    // Get rejection reason from request body
    const { reason } = await request.json()

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { message: 'Rejection reason is required' },
        { status: 400 }
      )
    }

    // Update listing status to rejected
    const { data: listing, error: updateError } = await supabase
      .from('listings')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error rejecting listing:', updateError)
      return NextResponse.json(
        { message: 'Failed to reject listing' },
        { status: 500 }
      )
    }

    // Log admin action
    await supabase.from('admin_actions').insert({
      admin_id: user.id,
      action: 'reject_listing',
      target_type: 'listing',
      target_id: id,
      details: {
        listing_title: listing.title,
        rejection_reason: reason,
      },
    })

    return NextResponse.json(
      { message: 'Listing rejected successfully', listing },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in POST /api/admin/listings/[id]/reject:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
