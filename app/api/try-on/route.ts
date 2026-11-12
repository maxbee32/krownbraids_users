import { NextRequest, NextResponse } from 'next/server';

const YOUCAM_BASE_URL = 'https://yce-api-01.makeupar.com';
const API_KEY = process.env.YOUCAM_API_KEY;
const PAYMENT_SERVICE_URL =
  process.env.PAYMENT_SERVICE_URL ||
  'https://60a6-82-36-98-104.ngrok-free.app/pservice';

async function uploadFileToYouCam(
  fileBuffer: ArrayBuffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const registerRes = await fetch(`${YOUCAM_BASE_URL}/s2s/v2.0/file`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: [
        {
          content_type: mimeType,
          file_name: fileName,
          file_size: fileBuffer.byteLength,
        },
      ],
    }),
  });

  const registerData = await registerRes.json();
  if (!registerRes.ok) {
    throw new Error(`Failed to register file: ${JSON.stringify(registerData)}`);
  }

  const fileEntry = registerData.data?.files?.[0];
  const uploadUrl = fileEntry?.requests?.[0]?.url;
  const uploadHeaders = fileEntry?.requests?.[0]?.headers;
  const fileId = fileEntry?.file_id;

  if (!uploadUrl || !fileId) {
    throw new Error(
      `File API returned unexpected shape: ${JSON.stringify(registerData)}`
    );
  }

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: uploadHeaders,
    body: fileBuffer,
  });

  if (!uploadRes.ok) {
    throw new Error(`Failed to upload file bytes: ${uploadRes.status}`);
  }

  return fileId;
}

export async function POST(req: NextRequest) {
  // Declared at the top so it stays in scope for the final return
  let remainingCredits: number | undefined;

  try {
    // ─── Credit check ───
    const auth = req.headers.get('authorization') ?? '';
    if (!auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const creditRes = await fetch(
        `${PAYMENT_SERVICE_URL}/api/v1/auth/try-on/consume-credit`,
        {
          method: 'POST',
          headers: {
            Authorization: auth,
            Accept: 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          cache: 'no-store',
        }
      );

      // If backend says "limit reached" (429), stop and inform the UI
      if (creditRes.status === 429) {
        const data = await creditRes.json().catch(() => ({}));
        return NextResponse.json(
          {
            error: data.error || 'Daily limit reached. Please try again tomorrow.',
            remainingCredits: 0,
          },
          { status: 429 }
        );
      }

      // If backend rejects the token, stop
      if (creditRes.status === 401 || creditRes.status === 403) {
        return NextResponse.json(
          { error: 'Session expired. Please log in again.' },
          { status: creditRes.status }
        );
      }

      // If backend is down entirely, safest is to block (don't burn credits)
      if (!creditRes.ok) {
        console.error(
          '[try-on] credit check failed:',
          creditRes.status,
          await creditRes.text().catch(() => '')
        );
        return NextResponse.json(
          { error: 'Could not verify your credits. Please try again.' },
          { status: 502 }
        );
      }

      // Success — capture remaining credits to return to frontend
      try {
        const creditData = await creditRes.json();
        remainingCredits = creditData.remaining;
      } catch {
        /* ignore parse errors — credit was already consumed */
      }
    } catch (err) {
      console.error('[try-on] credit service unreachable:', err);
      return NextResponse.json(
        { error: 'Service unavailable. Please try again.' },
        { status: 502 }
      );
    }
    // ─── END of credit check ───

    const formData = await req.formData();
    const userPhoto = formData.get('userPhoto') as File;
    const styleId = formData.get('styleId') as string;

    if (!userPhoto) {
      console.warn('[try-on] missing userPhoto');
      return NextResponse.json({ error: 'Missing user photo' }, { status: 400 });
    }

    if (!styleId) {
      console.warn('[try-on] missing styleId');
      return NextResponse.json({ error: 'Missing styleId' }, { status: 400 });
    }

    const styleMap: Record<string, string> = {
      '999': '/assets/img/style-1.jpg',
      '1000': '/assets/img/style-5.jpg',
      '1001': '/assets/img/style-11.jpg',
      '1002': '/assets/img/style-12.jpg',
    };

    const styleImagePath = styleMap[styleId];
    if (!styleImagePath) {
      console.warn(`[try-on] unknown styleId: ${styleId}`);
      return NextResponse.json({ error: 'Invalid style' }, { status: 400 });
    }

    // 1. Upload the user's selfie to YouCam
    const userBuffer = await userPhoto.arrayBuffer();
    const srcFileId = await uploadFileToYouCam(
      userBuffer,
      'selfie.jpg',
      'image/jpg'
    );

    // 2. Upload the style reference
    const baseUrl = req.nextUrl.origin;
    const styleResponse = await fetch(`${baseUrl}${styleImagePath}`);
    if (!styleResponse.ok) {
      throw new Error('Failed to load style reference image');
    }
    const styleBuffer = await styleResponse.arrayBuffer();
    const refFileId = await uploadFileToYouCam(
      styleBuffer,
      'style.jpg',
      'image/jpg'
    );

    // 3. Start the Hair Transfer task
    const taskRes = await fetch(
      `${YOUCAM_BASE_URL}/s2s/v2.1/task/hair-transfer`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          src_file_id: srcFileId,
          ref_file_id: refFileId,
          style: 'customize',
          hair_color: 'src',
        }),
      }
    );

    const taskData = await taskRes.json();
    if (!taskRes.ok) {
      return NextResponse.json(
        { error: taskData.message || 'Task creation failed' },
        { status: taskRes.status }
      );
    }

    return NextResponse.json({
      taskId: taskData.data.task_id,
      remainingCredits,
    });
  } catch (error: any) {
    console.error('[try-on] error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}