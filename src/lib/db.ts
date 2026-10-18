import { openDB, type DBSchema, type IDBPDatabase } from "idb"

export interface LocalAttempt {
  id: string
  mode: string
  title: string
  score: number
  date: string
  summary: string
  details: Record<string, unknown>
  assets?: {
    sketchUrl?: string
    dressImageUrl?: string
    modelUrl?: string
    dielineUrl?: string
  }
}

export interface LocalNote {
  id: string
  title: string
  content: string
  measurements: Record<string, number>
  updatedAt: string
}

interface VastraDB extends DBSchema {
  attempts: {
    key: string
    value: LocalAttempt
    indexes: { "by-date": string; "by-mode": string }
  }
  notes: {
    key: string
    value: LocalNote
  }
  cachedCurriculum: {
    key: string
    value: { id: string; data: unknown; cachedAt: number }
  }
}

let dbPromise: Promise<IDBPDatabase<VastraDB>> | null = null

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<VastraDB>("vastra-shastra-db", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("attempts")) {
          const attemptStore = db.createObjectStore("attempts", { keyPath: "id" })
          attemptStore.createIndex("by-date", "date")
          attemptStore.createIndex("by-mode", "mode")
        }
        if (!db.objectStoreNames.contains("notes")) {
          db.createObjectStore("notes", { keyPath: "id" })
        }
        if (!db.objectStoreNames.contains("cachedCurriculum")) {
          db.createObjectStore("cachedCurriculum", { keyPath: "id" })
        }
      }
    })
  }
  return dbPromise
}

export async function saveLocalAttempt(attempt: LocalAttempt) {
  const db = await getDB()
  await db.put("attempts", attempt)
}

export async function getLocalAttempts(): Promise<LocalAttempt[]> {
  const db = await getDB()
  const list = await db.getAll("attempts")
  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function saveLocalNote(note: LocalNote) {
  const db = await getDB()
  await db.put("notes", note)
}

export async function getLocalNote(id: string = "default-note"): Promise<LocalNote | undefined> {
  const db = await getDB()
  return await db.get("notes", id)
}
