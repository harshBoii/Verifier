import { NextResponse } from 'next/server';
import { permissionMiddleware } from './app/lib/RWCmiddleware';

export async function middleware(request) {
  const result = await permissionMiddleware(request);

  // If permissionMiddleware returned a NextResponse that is NOT NextResponse.next(),
  // it means it already decided to block or send an error.
  if (result instanceof NextResponse && result.status>300) {
    console.log(result.status)
    return new NextResponse(
      JSON.stringify({ error: "Permission Denied , Contact Us if You Think There Is Something Wrong" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  console.log("-------------------Passss--------------------");
  return NextResponse.next();
}


// This config ensures the middleware runs on all API routes
export const config = {
  matcher: '/api/:path*',
};

// import { NextResponse } from 'next/server';
// import { routePermissions, Permissions } from '@/app/lib/route-permission'; // Adjust path if needed

// export async function middleware(request) {
//   const { pathname } = request.nextUrl;

//   // --- 1. PREVENT INFINITE LOOP ---
//   // If the request is for the permission check API itself, let it pass.
//   if (pathname === '/api/permissions/check') {
//     return NextResponse.next();
//   }

//   // --- 2. IDENTIFY REQUIRED PERMISSION ---
//   const routePerm = routePermissions.find((rp) => pathname.startsWith(rp.prefix));
//   if (!routePerm || routePerm.permission === Permissions.NONE) {
//     return NextResponse.next(); // No permission check needed for this route.
//   }
//   const permissionNeeded = routePerm.permission;

//   // --- 3. CALL THE PERMISSION CHECK API AND AWAIT THE RESULT ---
//   try {
//     const checkUrl = new URL('/api/permissions/check', request.url);

//     const response = await fetch(checkUrl.toString(), {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         // Forward the original request's cookies so the check API knows who is logged in
//         'Cookie': request.headers.get('cookie'),
//       },
//       body: JSON.stringify({ permissionNeeded }),
//     });

//     // --- 4. ACT ON THE API'S RESPONSE ---
//     // If the check API returned an error (e.g., 401, 403), block the request.
//     if (!response.ok) {
//       const errorData = await response.json();
//       return new NextResponse(JSON.stringify({ error: errorData.error || 'Forbidden' }), { status: response.status });
//     }

//     // If the check API returned success, permission is granted.
//     return NextResponse.next();

//   } catch (error) {
//     console.error("Middleware fetch error:", error);
//     return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
//   }
// }

// // This config ensures the middleware runs on all API routes
// export const config = {
//   matcher: '/api/:path*',
// };
