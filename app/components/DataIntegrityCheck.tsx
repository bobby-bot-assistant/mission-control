'use client'

import { useEffect, useState } from 'react'

interface IntegrityStatus {
  checking: boolean
  passed?: boolean
  errors: string[]
  warnings: string[]
}

export default function DataIntegrityCheck() {
  const [status, setStatus] = useState<IntegrityStatus>({
    checking: true,
    errors: [],
    warnings: []
  })

  useEffect(() => {
    async function checkIntegrity() {
      try {
        const response = await fetch('/api/integrity-check')
        const result = await response.json()
        setStatus({
          checking: false,
          passed: result.passed,
          errors: result.errors || [],
          warnings: result.warnings || []
        })
      } catch (error) {
        setStatus({
          checking: false,
          passed: false,
          errors: ['Failed to check data integrity'],
          warnings: []
        })
      }
    }

    checkIntegrity()
  }, [])

  if (status.checking) return null
  if (status.passed && status.warnings.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 max-w-md z-50">
      {status.errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-2">
          <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">Data Integrity Errors</h3>
          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
            {status.errors.map((error, i) => (
              <li key={i}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {status.warnings.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Data Warnings</h3>
          <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
            {status.warnings.map((warning, i) => (
              <li key={i}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}