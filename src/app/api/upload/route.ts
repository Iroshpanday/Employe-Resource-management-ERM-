// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs"; // ensure Node runtime

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", "cv");
    await mkdir(uploadDir, { recursive: true });

    //Unique filename generation

    const ext = path.extname(file.name) || "";
    const base = crypto.randomBytes(16).toString("hex");
    const filename = `${base}${ext}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    // Public URL path for <img> or download links
    const publicPath = `/uploads/cv/${filename}`;

    return NextResponse.json({ path: publicPath }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
