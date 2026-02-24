import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isLoginPage = nextUrl.pathname.startsWith("/login")
      if (isLoginPage) return true
      if (isLoggedIn) return true
      return false
    },
  },
} satisfies NextAuthConfig
