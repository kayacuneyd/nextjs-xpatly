import { createAdminClient, createClient } from '@/lib/supabase/server'
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

    // Delete the user or mark as rejected (use admin client)
    // For now, we'll ban the user and set is_approved to false
    const { error: updateError } = await adminSupabase
      .from('users')
      .update({ 
        is_approved: false,
        is_banned: true 
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error rejecting user:', updateError)
      return NextResponse.json({ error: 'Failed to reject user' }, { status: 500 })
    }

    // Log the action
    await adminSupabase.from('admin_actions').insert({
      admin_id: user.id,
      action: 'reject_user',
      target_type: 'user',
      target_id: id,
      reason: 'User registration rejected',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error rejecting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
