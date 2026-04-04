import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserFromRequest } from "@/lib/auth";

// GET /api/posts/[postId]/comments
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> },
) {
  const session = await getSessionUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await context.params;

  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, avatar: true },
      },
      likes: { select: { userId: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          likes: { select: { userId: true } },
        },
      },
    },
  });

  return NextResponse.json({ comments });
}

// POST /api/posts/[postId]/comments
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> },
) {
  const session = await getSessionUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await context.params;
  const { text } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json(
      { error: "Comment text is required" },
      { status: 400 },
    );
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const comment = await prisma.comment.create({
    data: { text: text.trim(), userId: session.userId, postId },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, avatar: true },
      },
      likes: { select: { userId: true } },
      replies: {
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          likes: { select: { userId: true } },
        },
      },
    },
  });

  return NextResponse.json({ comment }, { status: 201 });
}
