import { NextResponse } from 'next/server'
import { getDb } from '../../../lib/json-db'
import { nanoid } from 'nanoid'

// DB path is managed by lib/json-db.ts via DATA_ROOT — no hardcoded paths

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const result = searchParams.get('result')
    
    const db = getDb()
    
    let sql = 'SELECT * FROM opportunities'
    const params: any[] = []
    
    if (query || result) {
      const conditions = []
      if (query) {
        conditions.push('(name LIKE ? OR description LIKE ?)')
        params.push(`%${query}%`, `%${query}%`)
      }
      if (result) {
        conditions.push('result = ?')
        params.push(result)
      }
      sql += ' WHERE ' + conditions.join(' AND ')
    }
    
    sql += ' ORDER BY sds_score DESC'
    
    const opportunities = db.prepare(sql).all(...params)
    db.close()
    
    // Parse tags JSON
    const parsed = opportunities.map((opp: any) => ({
      ...opp,
      tags: opp.tags ? JSON.parse(opp.tags) : []
    }))
    
    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Failed to fetch opportunities:', error)
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const db = getDb()
    
    const id = data.id || `opp_${nanoid(10)}`
    const tags = JSON.stringify(data.tags || [])
    
    db.prepare(`
      INSERT INTO opportunities (
        id, name, description, sds_score, amount, deadline, 
        result, related_project_id, reasoning, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run({
      id: id,
      name: data.name,
      description: data.description || null,
      sds_score: data.sds_score,
      amount: data.amount || null,
      deadline: data.deadline || null,
      result: data.result || 'LATER',
      related_project_id: data.related_project_id || null,
      reasoning: data.reasoning || null,
      tags: tags
    })
    
    const created = db.prepare('SELECT * FROM opportunities WHERE id = ?').all(id)[0]
    db.close()
    
    return NextResponse.json({
      ...created,
      tags: created.tags ? JSON.parse(created.tags) : []
    })
  } catch (error) {
    console.error('Failed to create opportunity:', error)
    return NextResponse.json({ error: 'Failed to create opportunity' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json()
    if (!data.id) {
      return NextResponse.json({ error: 'Opportunity ID required' }, { status: 400 })
    }
    
    const db = getDb()
    
    const updates = []
    const params = []
    
    if ('name' in data) { updates.push('name = ?'); params.push(data.name) }
    if ('description' in data) { updates.push('description = ?'); params.push(data.description) }
    if ('sds_score' in data) { updates.push('sds_score = ?'); params.push(data.sds_score) }
    if ('amount' in data) { updates.push('amount = ?'); params.push(data.amount) }
    if ('deadline' in data) { updates.push('deadline = ?'); params.push(data.deadline) }
    if ('result' in data) { updates.push('result = ?'); params.push(data.result) }
    if ('related_project_id' in data) { updates.push('related_project_id = ?'); params.push(data.related_project_id) }
    if ('reasoning' in data) { updates.push('reasoning = ?'); params.push(data.reasoning) }
    if ('tags' in data) { updates.push('tags = ?'); params.push(JSON.stringify(data.tags)) }
    
    updates.push('updated_at = datetime("now")')
    params.push(data.id)
    
    db.prepare(`
      UPDATE opportunities 
      SET ${updates.join(', ')}
      WHERE id = ?
    `).run(...params)
    
    const updated = db.prepare('SELECT * FROM opportunities WHERE id = ?').all(data.id)[0]
    db.close()
    
    return NextResponse.json({
      ...updated,
      tags: updated.tags ? JSON.parse(updated.tags) : []
    })
  } catch (error) {
    console.error('Failed to update opportunity:', error)
    return NextResponse.json({ error: 'Failed to update opportunity' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Opportunity ID required' }, { status: 400 })
    }
    
    const db = getDb()
    db.prepare('DELETE FROM opportunities WHERE id = ?').run(id)
    db.close()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete opportunity:', error)
    return NextResponse.json({ error: 'Failed to delete opportunity' }, { status: 500 })
  }
}