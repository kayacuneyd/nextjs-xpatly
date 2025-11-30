import { db } from '@/lib/db'
import { adminActions, users } from '@/lib/db/schema'
import { createClient } from '@/lib/supabase/server'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if current user is admin
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1)

    if (!currentUser[0] || !['super_admin', 'moderator'].includes(currentUser[0].role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const { is_approved } = await request.json()

    // Update user approval status
    await db
      .update(users)
      .set({ isApproved: is_approved })
      .where(eq(users.id, id))

    // Log the action
    await db.insert(adminActions).values({
      adminId: user.id,
      actionType: 'approve_user',
      targetId: id,
      reason: is_approved ? 'User approved' : 'User approval revoked',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error approving user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
