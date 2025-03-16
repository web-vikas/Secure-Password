export interface User {
  id: string
  email: string
  passwordHash?: string // Optional for email-only auth
  createdAt: Date
  updatedAt: Date
}

export interface PasswordEntry {
  id: string
  userId: string
  name: string
  encryptedPassword: string
  website?: string
  username?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface SharedPassword {
  id: string
  passwordId: string
  token: string
  creatorId: string
  createdAt: Date
  expiresAt: Date
  accessed: boolean
}

export interface TOTPSession {
  id: string
  email: string
  code: string
  expiresAt: Date
}

