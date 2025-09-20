// app/lib/idfyClient.js
const IDFY_BASE_URL = "https://api.idfy.com/v3";
const CLIENT_ID = process.env.IDFY_CLIENT_ID;
const CLIENT_SECRET = process.env.IDFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.IDFY_REDIRECT_URI;

export async function exchangeCodeForToken(code) {
  const tokenRes = await fetch(`${IDFY_BASE_URL}/digilocker/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
    },
    body: JSON.stringify({
      code,
      grant_type: "authorization_code",
      redirect_uri: REDIRECT_URI,
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) throw new Error("Failed to fetch access token.");
  return tokenData;
}

export async function fetchDigilockerDocs(accessToken) {
  const docsRes = await fetch(`${IDFY_BASE_URL}/digilocker/fetch`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return await docsRes.json();
}
