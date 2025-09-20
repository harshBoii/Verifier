// app/api/verification/digilocker/initiate/route.js
import { NextResponse } from 'next/server';

const IDFY_BASE_URL = "https://api.idfy.com/v3";
const CLIENT_ID = process.env.IDFY_CLIENT_ID;
const REDIRECT_URI_BASE = process.env.IDFY_REDIRECT_URI_BASE; 
// e.g. "https://yourapp.com/api/verification/digilocker"
//or https://yourapp.com/api/verification

export async function POST(request) {
  try {
    const { section, userId } = await request.json();

    if (!["address", "bank", "pf", "education"].includes(section)) {
      return NextResponse.json({ error: "Invalid section." }, { status: 400 });
    }

    const redirectUri = `${REDIRECT_URI_BASE}/${section}`;

    const url = `${IDFY_BASE_URL}/digilocker/authorize` +
      `?client_id=${CLIENT_ID}` +
      `&redirect_uri=${redirectUri}` +
      `&response_type=code` +
      `&scope=digilocker.read` +
      `&state=${userId}`;

    return NextResponse.json({ success: true, url });

  } catch (error) {
    console.error("Digilocker Initiation Error:", error.message);
    return NextResponse.json({ error: "Failed to initiate DigiLocker verification." }, { status: 500 });
  }
}
