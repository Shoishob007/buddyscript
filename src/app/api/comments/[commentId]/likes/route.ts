import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserFromRequest } from "@/lib/auth";

// POST /api/comments/[commentId]/likes - toggle like
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ commentId: string }> },
) {
  const session = await getSessionUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { commentId } = await context.params;

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const existing = await prisma.commentLike.findUnique({
    where: { userId_commentId: { userId: session.userId, commentId } },
  });

  if (existing) {
    await prisma.commentLike.delete({ where: { id: existing.id } });
    const count = await prisma.commentLike.count({ where: { commentId } });
    return NextResponse.json({ liked: false, count });
  } else {
    await prisma.commentLike.create({
      data: { userId: session.userId, commentId },
    });
    const count = await prisma.commentLike.count({ where: { commentId } });
    const likers = await prisma.commentLike.findMany({
      where: { commentId },
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
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
