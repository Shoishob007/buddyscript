import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth";
import { query } from "@/lib/db";
import { randomUUID } from "crypto";

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

  const comment = await query<{ id: string }>(
    `SELECT id FROM "Comment" WHERE id = $1 LIMIT 1`,
    [commentId],
  );
  if (!comment.rows[0]) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const existing = await query<{ id: string }>(
    `SELECT id FROM "CommentLike" WHERE "userId" = $1 AND "commentId" = $2 LIMIT 1`,
    [session.userId, commentId],
  );

  if (existing.rows[0]) {
    await query(`DELETE FROM "CommentLike" WHERE id = $1`, [
      existing.rows[0].id,
    ]);
    const countRes = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM "CommentLike" WHERE "commentId" = $1`,
      [commentId],
    );
    const count = Number(countRes.rows[0]?.count || 0);
    return NextResponse.json({ liked: false, count });
  } else {
    await query(
      `INSERT INTO "CommentLike" (id, "createdAt", "userId", "commentId") VALUES ($1, NOW(), $2, $3)`,
      [randomUUID(), session.userId, commentId],
    );
    const countRes = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM "CommentLike" WHERE "commentId" = $1`,
      [commentId],
    );
    const count = Number(countRes.rows[0]?.count || 0);
    const likers = await query<{
      id: string;
      firstName: string;
      lastName: string;
    }>(
      `SELECT u.id, u."firstName", u."lastName"
       FROM "CommentLike" cl
       JOIN "User" u ON u.id = cl."userId"
       WHERE cl."commentId" = $1
       ORDER BY cl."createdAt" DESC
       LIMIT 5`,
      [commentId],
    );
    return NextResponse.json({
      liked: true,
      count,
      likers: likers.rows,
    });
  }
}
