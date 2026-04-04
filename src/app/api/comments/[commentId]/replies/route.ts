import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserFromRequest } from "@/lib/auth";

// POST /api/comments/[commentId]/replies
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ commentId: string }> },
) {
  const session = await getSessionUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { commentId } = await context.params;
  const { text } = await req.json();

  if (!text?.trim()) {
    return NextResponse.json(
      { error: "Reply text is required" },
      { status: 400 },
    );
  }

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const reply = await prisma.reply.create({
    data: { text: text.trim(), userId: session.userId, commentId },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, avatar: true },
      },
      likes: { select: { userId: true } },
    },
  });

  return NextResponse.json({ reply }, { status: 201 });
}
