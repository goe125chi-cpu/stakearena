import { NextResponse } from 'next/server';

const CLOUD_NAME = 'diozj9cda';
const API_KEY = '231181166355341';
const API_SECRET = 'NEjdNzrilCTfE-bJlWMTz7Q-TzY';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const matchId = formData.get('matchId');
    const userId = formData.get('userId');

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = file.type;
    const dataUri = `data:${mimeType};base64,${base64}`;

    // Upload to Cloudinary
    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'stakearena/results';
    const publicId = `match_${matchId}_user_${userId}_${timestamp}`;

    // Generate signature
    const crypto = await import('crypto');
    const signStr = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`;
    const signature = crypto.createHash('sha256').update(signStr).digest('hex');

    const uploadForm = new FormData();
    uploadForm.append('file', dataUri);
    uploadForm.append('api_key', API_KEY);
    uploadForm.append('timestamp', timestamp);
    uploadForm.append('signature', signature);
    uploadForm.append('folder', folder);
    uploadForm.append('public_id', publicId);

    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: uploadForm
    });

    const uploadData = await uploadRes.json();

    if (uploadData.error) {
      return NextResponse.json({ error: uploadData.error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      url: uploadData.secure_url,
      publicId: uploadData.public_id 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
