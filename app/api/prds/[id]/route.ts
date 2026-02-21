import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { dataPath } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const prdId = params.id;
    
    // Try prds/ directory first (legacy location)
    const paths = [
      dataPath('prds', `${prdId}-prd.md`),
      dataPath('prds', `${prdId}.md`),
      dataPath('pipeline', 'prds', `${prdId}.md`),
      dataPath('pipeline', 'prds', `${prdId}-prd.md`),
    ];
    
    for (const filePath of paths) {
      try {
        const content = await readFile(filePath, 'utf-8');
        return new NextResponse(content, {
          headers: { 'Content-Type': 'text/plain' },
        });
      } catch {
        continue;
      }
    }
    
    return new NextResponse('PRD not found', { status: 404 });
  } catch (error) {
    console.error('Error loading PRD:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}