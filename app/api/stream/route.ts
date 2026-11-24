import { NextResponse } from 'next/server';
import { getStreamEvents } from '@/lib/data';

export const dynamic = 'force-dynamic';

/** GET /api/stream — latest activity feed events. */
export async function GET() {
  return NextResponse.json(
    { events: await getStreamEvents() },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}