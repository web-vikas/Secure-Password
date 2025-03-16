import mongoose, { Schema } from "mongoose"
import type { User, PasswordEntry, SharedPassword, TOTPSession } from "../types"

// User Schema
const UserSchema = new Schema<User>({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String }, // Optional for email-only auth
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Password Entry Schema
const PasswordEntrySchema = new Schema<PasswordEntry>({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  encryptedPassword: { type: String, required: true },
  website: { type: String },
  username: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

// Shared Password Schema with TTL index
const SharedPasswordSchema = new Schema<SharedPassword>({
  passwordId: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  creatorId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  accessed: { type: Boolean, default: false },
})

// Create TTL index for automatic expiration
SharedPasswordSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// TOTP Session Schema with TTL index
const TOTPSessionSchema = new Schema<TOTPSession>({
  email: { type: String, required: true },
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
})

// Create TTL index for automatic expiration
TOTPSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

// Create models
export const UserModel = mongoose.models.User || mongoose.model<User>("User", UserSchema)
export const PasswordEntryModel =
  mongoose.models.PasswordEntry || mongoose.model<PasswordEntry>("PasswordEntry", PasswordEntrySchema)
export const SharedPasswordModel =
  mongoose.models.SharedPassword || mongoose.model<SharedPassword>("SharedPassword", SharedPasswordSchema)
export const TOTPSessionModel =
  mongoose.models.TOTPSession || mongoose.model<TOTPSession>("TOTPSession", TOTPSessionSchema)

