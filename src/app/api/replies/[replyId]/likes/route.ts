import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserFromRequest } from "@/lib/auth";

// POST /api/replies/[replyId]/likes - toggle like
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ replyId: string }> },
) {
  const session = await getSessionUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { replyId } = await context.params;

  const reply = await prisma.reply.findUnique({ where: { id: replyId } });
  if (!reply) {
    return NextResponse.json({ error: "Reply not found" }, { status: 404 });
  }

  const existing = await prisma.replyLike.findUnique({
    where: { userId_replyId: { userId: session.userId, replyId } },
  });

  if (existing) {
    await prisma.replyLike.delete({ where: { id: existing.id } });
    const count = await prisma.replyLike.count({ where: { replyId } });
    return NextResponse.json({ liked: false, count });
  } else {
    await prisma.replyLike.create({
      data: { userId: session.userId, replyId },
    });
    const count = await prisma.replyLike.count({ where: { replyId } });
    const likers = await prisma.replyLike.findMany({
      where: { replyId },
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
