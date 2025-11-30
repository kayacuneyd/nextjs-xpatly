import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const adminSupabase = createAdminClient()
    
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if current user is admin (use admin client to bypass RLS)
    const { data: currentUser } = await adminSupabase
      .from('users')
      .select('role, is_banned')
      .eq('id', user.id)
      .single()

    if (!currentUser || currentUser.is_banned || !['super_admin', 'moderator'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const { is_approved } = await request.json()

    // Update user approval status (use admin client)
    const { error: updateError } = await adminSupabase
      .from('users')
      .update({ is_approved })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating user approval:', updateError)
      return NextResponse.json({ error: 'Failed to update approval status' }, { status: 500 })
    }

    // Log the action
    await adminSupabase.from('admin_actions').insert({
      admin_id: user.id,
      action: is_approved ? 'approve_user' : 'revoke_approval',
      target_type: 'user',
      target_id: id,
      reason: is_approved ? 'User approved' : 'User approval revoked',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error approving user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
