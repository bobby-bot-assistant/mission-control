import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

const DATA_ROOT = path.join(process.cwd(), '..', 'mission-control-data')

export interface IntegrityCheckResult {
  passed: boolean
  errors: string[]
  warnings: string[]
}

export async function checkDataIntegrity(): Promise<IntegrityCheckResult> {
  const errors: string[] = []
  const warnings: string[] = []

  // Check if data root exists
  if (!fs.existsSync(DATA_ROOT)) {
    errors.push(`CRITICAL: Mission Control data directory not found at ${DATA_ROOT}`)
    return { passed: false, errors, warnings }
  }

  // Required files
  const requiredFiles = [
    'prds/infant-mental-health-prd.md',
    'checksums/infant-mental-health-prd.sha256'
  ]

  for (const file of requiredFiles) {
    const filePath = path.join(DATA_ROOT, file)
    if (!fs.existsSync(filePath)) {
      errors.push(`MISSING: Required file not found: ${file}`)
    } else if (file.endsWith('.md')) {
      // Verify checksum if it's a content file
      const checksumFile = file.replace('.md', '.sha256').replace('prds/', 'checksums/')
      const checksumPath = path.join(DATA_ROOT, checksumFile)
      
      if (fs.existsSync(checksumPath)) {
        const expectedChecksum = fs.readFileSync(checksumPath, 'utf8').split(' ')[0].trim()
        const fileContent = fs.readFileSync(filePath)
        const actualChecksum = crypto.createHash('sha256').update(fileContent).digest('hex')
        
        if (expectedChecksum !== actualChecksum) {
          errors.push(`INTEGRITY: Checksum mismatch for ${file}`)
        }
      } else {
        warnings.push(`No checksum found for ${file}`)
      }
    }
  }

  // Check feedback directory is writable
  const feedbackDir = path.join(process.cwd(), '..', '..', 'feedback', 'pending')
  try {
    fs.accessSync(feedbackDir, fs.constants.W_OK)
  } catch {
    warnings.push('Feedback directory not writable')
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings
  }
}

export function createChecksum(filePath: string): string {
  const content = fs.readFileSync(filePath)
  return crypto.createHash('sha256').update(content).digest('hex')
}

export async function backupDataBeforeRebuild(): Promise<string> {
  const timestamp = new Date().toISOString().replace(/:/g, '-')
  const backupDir = path.join(DATA_ROOT, 'backups', `backup-${timestamp}`)
  
  // Create backup directory
  fs.mkdirSync(backupDir, { recursive: true })
  
  // Copy all critical files
  const filesToBackup = [
    'prds',
    'pipeline-history',
    'checksums'
  ]
  
  for (const dir of filesToBackup) {
    const source = path.join(DATA_ROOT, dir)
    const dest = path.join(backupDir, dir)
    if (fs.existsSync(source)) {
      fs.cpSync(source, dest, { recursive: true })
    }
  }
  
  return backupDir
}