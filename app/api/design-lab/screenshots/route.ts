import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

/**
 * Detect MIME type from file buffer magic numbers
 */
function detectMimeType(buffer: Buffer): string {
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return 'image/jpeg'
  }
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return 'image/png'
  }
  // GIF: GIF87a or GIF89a
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return 'image/gif'
  }
  // WebP: RIFF....WEBP
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
    return 'image/webp'
  }
  return 'application/octet-stream'
}

function getExtensionFromMimeType(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  }
  return map[mimeType] || 'bin'
}

/**
 * POST /api/design-lab/screenshots
 * Uploads a screenshot to the Design Lab with proper permissions and correct extension
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const customFilename = formData.get('filename') as string | null
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Read file buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Detect actual MIME type from content
    const detectedMimeType = detectMimeType(buffer)
    const correctExtension = getExtensionFromMimeType(detectedMimeType)
    
    // Validate it's an image
    if (!detectedMimeType.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File must be an image (JPEG, PNG, GIF, WebP)' },
        { status: 400 }
      )
    }

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const baseName = customFilename 
      ? customFilename.replace(/\.[^/.]+$/, '') // Remove any extension
      : file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9.-]/g, '-')
    
    const filename = `${baseName}-${timestamp}.${correctExtension}`

    // Target directory: public/design-lab/screenshots
    const targetDir = path.join(process.cwd(), 'public', 'design-lab', 'screenshots')
    await mkdir(targetDir, { recursive: true })
    
    const targetPath = path.join(targetDir, filename)
    
    // Write file with proper permissions (readable by all)
    await writeFile(targetPath, buffer, { mode: 0o644 })
    
    // Return the public path
    const publicPath = `/design-lab/screenshots/${filename}`
    
    return NextResponse.json({
      success: true,
      path: publicPath,
      filename,
      mimeType: detectedMimeType,
      size: buffer.length
    })
    
  } catch (error: any) {
    console.error('Screenshot upload failed:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * Standard screenshot naming convention:
 * - {project}-{page}-{description}-{timestamp}.{ext}
 * - Example: pulse-scorecard-trust-statement-20260221.jpg
 */
