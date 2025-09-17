import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save inside public/uploads
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(process.cwd(), "public", "uploads", fileName);

    await writeFile(filePath, buffer);

    // Return the public URL
    return NextResponse.json({
      url: `/uploads/${fileName}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
