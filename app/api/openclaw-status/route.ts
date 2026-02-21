import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // Read from the token usage file that Daisy updates
    const tokenFile = path.join(process.cwd(), '..', '.token-usage.json');
    
    try {
      const data = await readFile(tokenFile, 'utf-8');
      const usage = JSON.parse(data);
      
      // Check if data is stale (older than 5 minutes)
      const age = Date.now() - new Date(usage.timestamp).getTime();
      const isStale = age > 5 * 60 * 1000;
      
      return NextResponse.json({
        ...usage,
        stale: isStale,
        ageSeconds: Math.round(age / 1000)
      });
      
    } catch (fileError) {
      // File doesn't exist or can't be read
      console.error('Token file error:', fileError);
      
      // Return last known good values
      return NextResponse.json({
        current: 56022,
        max: 200000,
        percentage: 28,
        error: 'Token file not found - showing last known values',
        stale: true
      });
    }
    
  } catch (error) {
    console.error('Error in openclaw-status API:', error);
    return NextResponse.json({
      current: 0,
      max: 200000,
      percentage: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}