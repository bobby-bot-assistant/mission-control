#!/usr/bin/env ts-node
/**
 * Design Lab Screenshot Verification Script
 * 
 * Scans design-lab.json entries and verifies/fixes screenshot files:
 * - Checks files exist
 * - Detects actual MIME type
 * - Renames files if extension doesn't match
 * - Updates JSON paths
 */

import { readFile, writeFile, rename, access } from 'fs/promises'
import path from 'path'
import { execSync } from 'child_process'

const DATA_FILE = '/Users/daisydukes/openclaw-projects/mission-control-data/design-lab.json'
const PUBLIC_DIR = '/Users/daisydukes/openclaw-projects/mission-control/public'

interface DesignReview {
  id: string
  page: string
  afterScreenshot: string
  beforeScreenshot: string
}

interface DesignLabData {
  reviews: DesignReview[]
}

/**
 * Detect MIME type using file command
 */
async function detectMimeType(filePath: string): Promise<string | null> {
  try {
    const output = execSync(`file -b --mime-type "${filePath}"`, { encoding: 'utf-8' })
    return output.trim()
  } catch {
    return null
  }
}

function getCorrectExtension(mimeType: string): string | null {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  }
  return map[mimeType] || null
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function main() {
  console.log('🔍 Design Lab Screenshot Verification\n')
  
  // Read design-lab.json
  const jsonContent = await readFile(DATA_FILE, 'utf-8')
  const data: DesignLabData = JSON.parse(jsonContent)
  
  let fixed = 0
  let missing = 0
  let ok = 0
  
  for (const review of data.reviews) {
    console.log(`\n📋 ${review.id}: ${review.page}`)
    
    // Check afterScreenshot
    if (review.afterScreenshot) {
      const screenshotPath = path.join(PUBLIC_DIR, review.afterScreenshot)
      const exists = await fileExists(screenshotPath)
      
      if (!exists) {
        console.log(`   ❌ Missing: ${review.afterScreenshot}`)
        missing++
      } else {
        const mimeType = await detectMimeType(screenshotPath)
        if (!mimeType) {
          console.log(`   ⚠️  Could not detect MIME type: ${review.afterScreenshot}`)
          continue
        }
        
        const correctExt = getCorrectExtension(mimeType)
        const currentExt = path.extname(review.afterScreenshot).toLowerCase().slice(1)
        
        if (correctExt && correctExt !== currentExt) {
          // Need to rename
          const newFilename = review.afterScreenshot.replace(/\.[^/.]+$/, `.${correctExt}`)
          const newPath = path.join(PUBLIC_DIR, newFilename)
          
          console.log(`   🔧 Extension mismatch: .${currentExt} → .${correctExt}`)
          console.log(`   📝 Renaming: ${review.afterScreenshot} → ${newFilename}`)
          
          await rename(screenshotPath, newPath)
          review.afterScreenshot = newFilename
          fixed++
        } else {
          console.log(`   ✅ OK: ${review.afterScreenshot} (${mimeType})`)
          ok++
        }
      }
    }
    
    // Check beforeScreenshot (same logic)
    if (review.beforeScreenshot) {
      const screenshotPath = path.join(PUBLIC_DIR, review.beforeScreenshot)
      const exists = await fileExists(screenshotPath)
      
 if (!exists) {
        console.log(`   ❌ Missing (before): ${review.beforeScreenshot}`)
        missing++
      } else {
        const mimeType = await detectMimeType(screenshotPath)
        if (!mimeType) continue
        
        const correctExt = getCorrectExtension(mimeType)
        const currentExt = path.extname(review.beforeScreenshot).toLowerCase().slice(1)
        
        if (correctExt && correctExt !== currentExt) {
          const newFilename = review.beforeScreenshot.replace(/\.[^/.]+$/, `.${correctExt}`)
          const newPath = path.join(PUBLIC_DIR, newFilename)
          
          console.log(`   🔧 Extension mismatch (before): .${currentExt} → .${correctExt}`)
          await rename(screenshotPath, newPath)
          review.beforeScreenshot = newFilename
          fixed++
        } else {
          ok++
        }
      }
    }
  }
  
  // Write updated JSON if changes were made
  if (fixed > 0) {
    console.log(`\n💾 Saving ${fixed} fixes to design-lab.json...`)
    await writeFile(DATA_FILE, JSON.stringify(data, null, 2))
  }
  
  console.log(`\n📊 Summary:`)
  console.log(`   ✅ OK: ${ok}`)
  console.log(`   🔧 Fixed: ${fixed}`)
  console.log(`   ❌ Missing: ${missing}`)
  
  if (missing > 0) {
    process.exit(1)
  }
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
