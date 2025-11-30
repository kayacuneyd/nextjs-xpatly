import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const adminSupabase = createAdminClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin (use admin client to bypass RLS)
    const { data: userData } = await adminSupabase
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

    // Prevent banning super admins (only super admins can ban other admins)
    const { data: targetUser } = await adminSupabase
      .from('users')
      .select('role')
      .eq('id', id)
      .single()

    if (
      targetUser?.role === 'super_admin' &&
      userData.role !== 'super_admin'
    ) {
      return NextResponse.json(
        { message: 'Cannot ban super admin' },
        { status: 403 }
      )
    }

    const { is_banned } = await request.json()

    // Update user ban status (use admin client)
    const { error: updateError } = await adminSupabase
      .from('users')
      .update({ is_banned })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating user ban status:', updateError)
      return NextResponse.json(
        { message: 'Failed to update ban status' },
        { status: 500 }
      )
    }

    // Log admin action
    await adminSupabase.from('admin_actions').insert({
      admin_id: user.id,
      action: is_banned ? 'ban_user' : 'unban_user',
      target_type: 'user',
      target_id: id,
    })

    return NextResponse.json(
      { message: `User ${is_banned ? 'banned' : 'unbanned'} successfully` },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in POST /api/admin/users/[id]/ban:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
