import { NextResponse, type NextRequest } from 'next/server';
import { getDashboard } from '@/lib/data';
import { isPeriod } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dashboard?period=7d|1m|3m|1y|all
 * Returns the full dashboard payload for the requested time period.
 */
export function GET(request: NextRequest) {
  const requested = request.nextUrl.searchParams.get('period') ?? '1y';

  if (!isPeriod(requested)) {
    return NextResponse.json(
      { message: `Invalid period "${requested}". Expected one of: 7d, 1m, 3m, 1y, all.` },
      { status: 400 },
    );
  }

  return NextResponse.json(getDashboard(requested), {
    headers: { 'Cache-Control': 'no-store' },
  });
}