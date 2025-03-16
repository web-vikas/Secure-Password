import "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    encryptionKey: string
    hasPassword: boolean
  }

  interface Session {
    user: {
      id: string
      email: string
      encryptionKey: string
      hasPassword: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    encryptionKey: string
    hasPassword: boolean
  }
}

