import { WebClient } from "@slack/web-api";
import { NextResponse } from 'next/server';

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN; 
const client = new WebClient(SLACK_BOT_TOKEN);

export async function POST(request) {
  try {
    // 1. Parse the request body for the target email and the message content
    const { email, message } = await request.json();

    if (!email || !message) {
      return NextResponse.json(
        { error: "Missing required parameters: 'email' and 'message' are required." },
        { status: 400 }
      );
    }

    let userId;
    // 2. Look up the Slack User ID using their email address
    try {
      const response = await client.users.lookupByEmail({ email: email });
      userId = response.user.id;
      console.log(`✅ Found Slack User ID: ${userId}`);
    } catch (error) {
      console.error("Slack user lookup failed:", error.data?.error || error.message);
      // If the user isn't found, return a specific 404 error
      if (error.data?.error === 'users_not_found') {
        return NextResponse.json({ error: `Slack user with email "${email}" not found.` }, { status: 404 });
      }
      // For other Slack API errors during lookup
      return NextResponse.json({ error: 'Failed to look up user in Slack.' }, { status: 500 });
    }

    let channelId;
    // 3. Open a direct message (DM) channel with the user
    try {
      const dmResponse = await client.conversations.open({ users: userId });
      channelId = dmResponse.channel.id;
    } catch (error) {
      console.error("Opening Slack DM failed:", error.data?.error || error.message);
      return NextResponse.json({ error: 'Failed to open a direct message channel with the user.' }, { status: 500 });
    }

    // 4. Post the message to the opened DM channel
    try {
      await client.chat.postMessage({
        channel: channelId,
        text: message, // Use the message from the request body
      });
      console.log(`✅ Message sent successfully to Slack user ${userId}`);
    } catch (error) {
      console.error("Sending Slack message failed:", error.data?.error || error.message);
      return NextResponse.json({ error: 'Failed to send message to Slack channel.' }, { status: 500 });
    }

    // 5. Return a success response
    return NextResponse.json({ success: true, message: "Slack message sent successfully!" });

  } catch (err) {
    // Catch any unexpected errors, like JSON parsing failures
    console.error("An unexpected error occurred in /api/slack:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
