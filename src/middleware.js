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
      // JSON.stringify({ error: result.error }),
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

