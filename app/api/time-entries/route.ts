import { getServerSession } from 'next-auth' // Import server-side auth helper from next-auth
import { authOptions } from '../auth/[...nextauth]/route' // Correct import path

export async function GET(request: Request) {
  const session = await getServerSession(authOptions) // Get authenticated session using server-side auth
  if (!session?.user?.name) { // Check if user is authenticated and has a name
    return new Response('Unauthorized', { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  // Verify the requesting user matches the userId parameter
  if (userId !== session.user.name) {
    return new Response('Unauthorized', { status: 401 })
  }

  // const entries = await db.query(
  //   'SELECT * FROM time_entries WHERE user_id = $1 ORDER BY date DESC',
  //   [userId]
  // )

  // Return dummy data for build
  return Response.json([{ id: 1, user_id: userId, date: '2025-07-02', start_time: '09:00', end_time: '17:00', description: 'Sample', duration: '8h', break_time: 30, project_id: null }])
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.name) {
    return new Response('Unauthorized', { status: 401 })
  }

  const data = await request.json()

  // Ensure the user_id matches the authenticated user
  if (data.user_id !== session.user.name) {
    return new Response('Unauthorized', { status: 401 })
  }

  // const result = await db.query(
  //   'INSERT INTO time_entries (user_id, date, start_time, end_time, description, duration, break_time, project_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
  //   [data.user_id, data.date, data.start_time, data.end_time, data.description, data.duration, data.break_time, data.project_id]
  // )

  // Return dummy data for build
  return Response.json({ id: 2, ...data })
}
