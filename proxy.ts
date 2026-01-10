import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Page access restrictions
const ADMIN_ONLY_PAGES = ["/feedbacks"];
const NON_ADMIN_ONLY_PAGES = ["/submit", "/cart", "/mycats"];

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Check if admin is accessing non-admin only pages
    if (
      token?.isAdmin &&
      NON_ADMIN_ONLY_PAGES.some((page) => path.startsWith(page))
    ) {
      return NextResponse.redirect(new URL("/feedbacks", req.url));
    }

    // Check if non-admin is accessing admin only pages
    if (
      !token?.isAdmin &&
      ADMIN_ONLY_PAGES.some((page) => path.startsWith(page))
    ) {
      return NextResponse.redirect(new URL("/submit", req.url));
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
        if (
          path.startsWith("/feedbacks") ||
          path.startsWith("/submit") ||
          path.startsWith("/mycats")
        ) {
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
  matcher: [
    "/feedbacks/:path*",
    "/submit/:path*",
    "/cart/:path*",
    "/mycats/:path*",
    "/auth",
  ],
};
