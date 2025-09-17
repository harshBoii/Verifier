import prisma from "@/app/lib/prisma";
import * as jose from "jose";

export async function POST(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    const { latitude, longitude, timestamp } = await req.json();

    if (!latitude || !longitude) {
      return new Response(JSON.stringify({ error: "Missing coordinates" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        isAddressVerified: true,
        verifiedAddress: {
          latitude,
          longitude,
          timestamp,
        },
      },
    });

    console.log("📍 Address verified for:", updatedUser.email);

    return new Response(
      JSON.stringify({ success: true, userId: updatedUser.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error saving location:", error);
    return new Response(JSON.stringify({ error: "Failed to save location" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET(req) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        isAddressVerified: true,
        verifiedAddress: true,
      },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error fetching location:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch location" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
