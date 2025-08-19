import { NextResponse } from 'next/server';
import { routePermissions, Permissions } from './route-permission';

export async function permissionMiddleware(request) {
  const { pathname } = request.nextUrl;

  // --- THIS IS THE FIX ---
  // If the request is for the permission check API itself, do nothing and let it proceed.
  // This prevents an infinite loop.
  if (pathname === '/api/permissions/check' || pathname === '/api/subscribe' || pathname === '/api/packages' || pathname ==="review/experience" || pathname ==="/api/submit-verification") {
    return NextResponse.next();
  }
  // --- END OF FIX ---

  // Find the required permission for the current route
  const routePerm = routePermissions.find((rp) => pathname.startsWith(rp.prefix));
  if (!routePerm || routePerm.permission === Permissions.NONE) {
    console.log("AADHE RAASTE")
    console.log(routePerm)
    return NextResponse.next(); // No permission check needed
  }

  // The permission required for this specific route
  const permissionNeeded = routePerm.permission;
  console.log(routePerm)

  // Construct the absolute URL for the internal API call to our check route
  const checkUrl = new URL('/api/permissions/check', request.url);

  try {
    // Call our dedicated API route to perform the permission check
    const response = await fetch(checkUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward the original request's cookies so the check API knows who is logged in
        'Cookie': request.headers.get('cookie'),
      },
      body: JSON.stringify({ permissionNeeded }),

    });

    // If the check API returns an error (e.g., 401, 403), block the request
    // and forward the error response to the client.
    if (!response.ok) {
      console.log("Sab Changa Nahi hai Ji",routePerm)
      const errorData = await response.json();
      console.log(errorData.error)
      return new NextResponse(JSON.stringify({ error: errorData.error || 'Forbidden' }), { status: response.status });
    }

    // If the check API returns a success (200 OK), it means permission is granted.
    // Allow the original request to proceed to its destination.
    console.log("Sab Changa hai Ji")
    return NextResponse.next();

  } catch (error) {
    console.error("Middleware fetch error:", error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
