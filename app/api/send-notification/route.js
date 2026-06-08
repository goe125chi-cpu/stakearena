import { NextResponse } from 'next/server';

const ONESIGNAL_APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_REST_API_KEY;

export async function POST(req) {
  try {
    const { userIds, title, message, url } = await req.json();

    const body = {
      app_id: ONESIGNAL_APP_ID,
      headings: { en: title },
      contents: { en: message },
      url: url || 'https://stakearena-sepia.vercel.app',
      ...(userIds && userIds.length > 0
        ? { include_external_user_ids: userIds }
        : { included_segments: ['All'] })
    };

    const res = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${ONESIGNAL_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Notification error:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
