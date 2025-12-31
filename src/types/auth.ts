export interface SignUpData {
  email: string
  password: string
  name: string
}

export interface SignInData {
  email: string
  password: string
}

export interface VerifyEmailData {
  email: string
  code: string
}

export interface ResetPasswordData {
  email: string
}

export interface NewPasswordData {
  token: string
  password: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  emailVerified: boolean
}

export interface Session {
  user: AuthUser
  expires: string
}