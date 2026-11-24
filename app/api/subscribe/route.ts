import { Prisma } from '@prisma/client';
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** POST /api/subscribe { email } */
export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const email = String((payload as { email?: unknown })?.email ?? '').trim();

  if (!email) {
    return NextResponse.json({ message: 'Email address is required.' }, { status: 400 });
  }

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ message: 'Please enter a valid email address.' }, { status: 400 });
  }

  let alreadySubscribed = false;

  try {
    await prisma.subscriber.create({ data: { email } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      alreadySubscribed = true;
    } else {
      throw error;
    }
  }

  return NextResponse.json(
    {
      ok: true,
      alreadySubscribed,
      message: alreadySubscribed
        ? `You're already subscribed — we'll keep sending reports to: ${email}`
        : `Thank you for subscribing! We'll send weekly reports to: ${email}`,
    },
    { status: alreadySubscribed ? 200 : 201 },
  );
}
