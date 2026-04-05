import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth";
import { query } from "@/lib/db";
import { randomUUID } from "crypto";

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

  const comment = await query<{ id: string }>(
    `SELECT id FROM "Comment" WHERE id = $1 LIMIT 1`,
    [commentId],
  );
  if (!comment.rows[0]) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const replyId = randomUUID();

  await query(
    `INSERT INTO "Reply" (id, text, "createdAt", "updatedAt", "userId", "commentId")
     VALUES ($1, $2, NOW(), NOW(), $3, $4)`,
    [replyId, text.trim(), session.userId, commentId],
  );

  const replyRes = await query<{
    id: string;
    text: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  }>(
    `SELECT r.id, r.text, r."createdAt", r."updatedAt", r."userId",
            u."firstName", u."lastName", u.avatar
     FROM "Reply" r
     JOIN "User" u ON u.id = r."userId"
     WHERE r.id = $1
     LIMIT 1`,
    [replyId],
  );

  const r = replyRes.rows[0];
  const reply = {
    id: r.id,
    text: r.text,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    userId: r.userId,
    user: {
      id: r.userId,
      firstName: r.firstName,
      lastName: r.lastName,
      avatar: r.avatar,
    },
    likes: [],
  };

  return NextResponse.json({ reply }, { status: 201 });
}
