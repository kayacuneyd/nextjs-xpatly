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

    const { is_verified } = await request.json()

    // Update user verification status
    const { error: updateError } = await supabase
      .from('users')
      .update({ is_verified })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating user verification:', updateError)
      return NextResponse.json(
        { message: 'Failed to update verification status' },
        { status: 500 }
      )
    }

    // Log admin action
    await supabase.from('admin_actions').insert({
      admin_id: user.id,
      action: is_verified ? 'verify_user' : 'unverify_user',
      target_type: 'user',
      target_id: id,
    })

    return NextResponse.json(
      { message: `User ${is_verified ? 'verified' : 'unverified'} successfully` },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in POST /api/admin/users/[id]/verify:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
