import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // If accessing /feedbacks, must be admin
    if (path.startsWith("/feedbacks")) {
      if (!token?.isAdmin) {
        return NextResponse.redirect(new URL("/submit", req.url));
      }
    }

    // If accessing /auth while logged in, redirect based on role
    if (path === "/auth" && token) {
      const redirectUrl = token.isAdmin ? "/feedbacks" : "/submit";
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Allow access to /auth without authentication
        if (path === "/auth") {
          return true;
        }

        // For protected routes, require authentication
        if (path.startsWith("/feedbacks") || path.startsWith("/submit")) {
          return !!token;
        }

        // Allow all other routes
        return true;
      },
    },
    pages: {
      signIn: "/auth",
    },
  }
);

export const config = {
  matcher: ["/feedbacks/:path*", "/submit/:path*", "/auth"],
};