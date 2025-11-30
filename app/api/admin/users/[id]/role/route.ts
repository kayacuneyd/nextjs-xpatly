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

    const { role } = await request.json()

    // Validate role
    const validRoles = ['user', 'owner', 'moderator', 'super_admin']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 })
    }

    // Only super admins can assign super_admin or moderator roles
    if (
      (role === 'super_admin' || role === 'moderator') &&
      userData.role !== 'super_admin'
    ) {
      return NextResponse.json(
        { message: 'Only super admins can assign admin roles' },
        { status: 403 }
      )
    }

    // Prevent changing own role
    if (id === user.id) {
      return NextResponse.json(
        { message: 'Cannot change your own role' },
        { status: 403 }
      )
    }

    // Update user role (use admin client)
    const { error: updateError } = await adminSupabase
      .from('users')
      .update({ role })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating user role:', updateError)
      return NextResponse.json(
        { message: 'Failed to update role' },
        { status: 500 }
      )
    }

    // Log admin action
    await adminSupabase.from('admin_actions').insert({
      admin_id: user.id,
      action: 'change_user_role',
      target_type: 'user',
      target_id: id,
      details: { new_role: role },
    })

    return NextResponse.json(
      { message: 'Role updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in POST /api/admin/users/[id]/role:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
