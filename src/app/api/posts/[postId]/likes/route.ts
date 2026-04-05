import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserFromRequest } from "@/lib/auth";

// POST /api/posts/[postId]/likes - toggle like
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> },
) {
  const session = await getSessionUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await context.params;

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Only can like public posts or own posts
  if (post.visibility === "private" && post.authorId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.postLike.findUnique({
    where: { userId_postId: { userId: session.userId, postId } },
  });

  if (existing) {
    await prisma.postLike.delete({ where: { id: existing.id } });
    const count = await prisma.postLike.count({ where: { postId } });
    return NextResponse.json({ liked: false, count });
  } else {
    await prisma.postLike.create({
      data: { userId: session.userId, postId },
    });
    const count = await prisma.postLike.count({ where: { postId } });
    // Get likers for display
    const likers = await prisma.postLike.findMany({
      where: { postId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
      take: 5,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      liked: true,
      count,
      likers: likers.map((l) => l.user),
    });
  }
}

// GET /api/posts/[postId]/likes - get likers
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ postId: string }> },
) {
  const session = await getSessionUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { postId } = await context.params;
  const likers = await prisma.postLike.findMany({
    where: { postId },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, avatar: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ likers: likers.map((l) => l.user) });
}
