import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserFromRequest } from "@/lib/auth";
import { writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

// GET /api/posts - list public posts + author's private posts
export async function GET(req: NextRequest) {
  const session = await getSessionUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const take = 10;

  const posts = await prisma.post.findMany({
    where: {
      OR: [{ visibility: "public" }, { authorId: session.userId }],
    },
    orderBy: { createdAt: "desc" },
    take,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: {
      author: {
        select: { id: true, firstName: true, lastName: true, avatar: true },
      },
      likes: {
        select: {
          userId: true,
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      _count: { select: { comments: true } },
    },
  });

  const nextCursor = posts.length === take ? posts[posts.length - 1].id : null;

  return NextResponse.json({ posts, nextCursor });
}

// POST /api/posts - create a post (multipart for image)
export async function POST(req: NextRequest) {
  const session = await getSessionUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const text = (formData.get("text") as string)?.trim();
    const visibility = (formData.get("visibility") as string) || "public";
    const image = formData.get("image") as File | null;

    if (!text && !image) {
      return NextResponse.json(
        { error: "Post must have text or an image" },
        { status: 400 },
      );
    }

    if (visibility !== "public" && visibility !== "private") {
      return NextResponse.json(
        { error: "visibility must be public or private" },
        { status: 400 },
      );
    }

    let imageUrl: string | null = null;
    if (image && image.size > 0) {
      if (image.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image must be under 10 MB" },
          { status: 400 },
        );
      }
      const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowed.includes(image.type)) {
        return NextResponse.json(
          { error: "Only JPEG, PNG, GIF, WEBP allowed" },
          { status: 400 },
        );
      }
      const ext = image.name.split(".").pop() || "jpg";
      const filename = `${randomUUID()}.${ext}`;
      const bytes = await image.arrayBuffer();
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await writeFile(path.join(uploadDir, filename), Buffer.from(bytes));
      imageUrl = `/uploads/${filename}`;
    }

    const post = await prisma.post.create({
      data: {
        text: text || "",
        imageUrl,
        visibility,
        authorId: session.userId,
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        likes: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        _count: { select: { comments: true } },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("[CREATE_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
