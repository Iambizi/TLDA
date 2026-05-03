import { convexAuthNextjsMiddleware, createRouteMatcher, nextjsMiddlewareRedirect } from "@convex-dev/auth/nextjs/server"

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/participants(.*)", "/events(.*)"])
const isLoginRoute = createRouteMatcher(["/login"])

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/login")
  }
  if (isLoginRoute(request) && (await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/dashboard")
  }
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
