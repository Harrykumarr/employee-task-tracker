import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ token }) {
      // Allow access only if user is authenticated
      return !!token;
    },
  },
  pages: {
    signIn: "/",
  },
});

export const config = { matcher: ["/dashboard", "/dashboard/:path*"] };