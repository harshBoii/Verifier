// app/api/verification/bank/route.js
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

const IDFY_BASE_URL = "https://api.idfy.com/v3/tasks/async/verify_with_source/ind_v2/bank_account";
const CLIENT_ID = process.env.IDFY_CLIENT_ID;
const CLIENT_SECRET = process.env.IDFY_CLIENT_SECRET;

async function pollResult(requestId, retries = 5, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(`${IDFY_BASE_URL}/${requestId}`, {
      method: "GET",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
      },
    });

    const result = await res.json();
    if (result?.status === "completed") return result;

    // wait before retry
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  return null;
}

export async function POST(request) {
  try {
    const { userId, accountNumber, ifsc } = await request.json();

    if (!accountNumber || !ifsc) {
      return NextResponse.json(
        { error: "Bank account number and IFSC are required." },
        { status: 400 }
      );
    }

    // Step 1: Create Penny Drop task
    const res = await fetch(IDFY_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
      },
      body: JSON.stringify({
        task_id: `bank_${userId}_${Date.now()}`, // unique ID
        group_id: "bank_verification",
        data: {
          account_number: accountNumber,
          ifsc: ifsc,
        },
      }),
    });

    const data = await res.json();

    if (!data.request_id) {
      return NextResponse.json(
        { error: "Failed to initiate bank verification." },
        { status: 500 }
      );
    }

    // Step 2: Poll result
    const result = await pollResult(data.request_id);

    if (
      !result ||
      result?.result?.status !== "success" ||
      !result?.result?.source_output?.account_name
    ) {
      return NextResponse.json(
        { error: "Bank verification failed." },
        { status: 400 }
      );
    }

    const accountName = result.result.source_output.account_name;

    // Step 3: Save to DB
    await prisma.user.update({
      where: { id: Number(userId) },
      data: {
        isBankVerified: true,
        verifiedAccountName: accountName,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Bank account verified successfully",
      accountName,
    });
  } catch (error) {
    console.error("Bank Verification Error:", error.message);
    return NextResponse.json(
      { error: "Bank verification failed." },
      { status: 500 }
    );
  }
}
