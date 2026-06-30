import { NextRequest } from 'next/server';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (!files || files.length === 0) {
      return Response.json({ error: 'No images provided' }, { status: 400 });
    }

    // Validate files
    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        return Response.json(
          { error: `Invalid file type: ${file.name}. Only JPG and PNG are accepted.` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return Response.json(
          { error: `File too large: ${file.name}. Max size is 5MB.` },
          { status: 400 }
        );
      }
    }

    // MVP: Convert to base64 and return (no real storage yet)
    const results = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${file.type};base64,${base64}`;

        return {
          id: crypto.randomUUID(),
          url: dataUrl,
          name: file.name,
          size: file.size,
          type: file.type,
        };
      })
    );

    return Response.json({ images: results });
  } catch {
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}
