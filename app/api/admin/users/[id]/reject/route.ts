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

    // Delete the user or mark as rejected
    // For now, we'll ban the user and set isApproved to false
    await db
      .update(users)
      .set({ 
        isApproved: false,
        isBanned: true 
      })
      .where(eq(users.id, id))

    // Log the action
    await db.insert(adminActions).values({
      adminId: user.id,
      actionType: 'reject_user',
      targetId: id,
      reason: 'User registration rejected',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error rejecting user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
