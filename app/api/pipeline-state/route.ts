import { NextResponse } from 'next/server';
import { readJSON, writeJSON, getFileVersion, VersionConflictError } from '@/lib/data';

export const dynamic = 'force-dynamic';

async function readData() {
  return readJSON<{ items: Record<string, any> }>('pipeline-state.json');
}

async function writeData(data: any, expectedVersion?: string) {
  return writeJSON('pipeline-state.json', data, expectedVersion);
}

export async function GET() {
  try {
    const data = await readData();
    return NextResponse.json(data);
  } catch (error) {
    // Return empty state if file doesn't exist
    return NextResponse.json({ items: {} });
  }
}

export async function POST(request: Request) {
  try {
    const currentVersion = await getFileVersion('pipeline-state.json');
    const data = await request.json();
    await writeData(data, currentVersion);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof VersionConflictError) {
      return NextResponse.json(
        { error: 'File was modified by another process. Please retry.' },
        { status: 409 }
      )
    }
    console.error('Error saving pipeline state:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const currentVersion = await getFileVersion('pipeline-state.json');
    const { id, ...updates } = await request.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const data = await readData();
    if (!data.items[id]) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    data.items[id] = { ...data.items[id], ...updates, lastUpdated: new Date().toISOString() };
    await writeData(data, currentVersion);
    return NextResponse.json({ success: true, item: data.items[id] });
  } catch (error: any) {
    if (error instanceof VersionConflictError) {
      return NextResponse.json(
        { error: 'File was modified by another process. Please retry.' },
        { status: 409 }
      )
    }
    console.error('Error patching pipeline item:', error);
    return NextResponse.json({ error: 'Failed to patch' }, { status: 500 });
  }
}