import { NextRequest, NextResponse } from 'next/server';

const YOUCAM_BASE_URL = 'https://yce-api-01.makeupar.com';
const API_KEY = process.env.YOUCAM_API_KEY;

export async function GET(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get('taskId');
  if (!taskId) {
    return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${YOUCAM_BASE_URL}/s2s/v2.1/task/hair-transfer/${taskId}`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || 'Status check failed' },
        { status: res.status }
      );
    }

    const status = data.data.task_status;

    if (status === 'success') {
      return NextResponse.json({
        status: 'success',
        resultUrl: data.data.results.url,
      });
    } else if (status === 'error') {
      return NextResponse.json({
        status: 'error',
        message: data.data.error_message || 'Generation failed',
      });
    } else {
      // 'running' or 'pending'
      return NextResponse.json({ status: 'processing' });
    }
  } catch (error: any) {
    console.error('[try-on status] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}