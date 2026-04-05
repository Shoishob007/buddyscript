import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth";
import { query } from "@/lib/db";
import { randomUUID } from "crypto";

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

  const reply = await query<{ id: string }>(
    `SELECT id FROM "Reply" WHERE id = $1 LIMIT 1`,
    [replyId],
  );
  if (!reply.rows[0]) {
    return NextResponse.json({ error: "Reply not found" }, { status: 404 });
  }

  const existing = await query<{ id: string }>(
    `SELECT id FROM "ReplyLike" WHERE "userId" = $1 AND "replyId" = $2 LIMIT 1`,
    [session.userId, replyId],
  );

  if (existing.rows[0]) {
    await query(`DELETE FROM "ReplyLike" WHERE id = $1`, [existing.rows[0].id]);
    const countRes = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM "ReplyLike" WHERE "replyId" = $1`,
      [replyId],
    );
    const count = Number(countRes.rows[0]?.count || 0);
    return NextResponse.json({ liked: false, count });
  } else {
    await query(
      `INSERT INTO "ReplyLike" (id, "createdAt", "userId", "replyId") VALUES ($1, NOW(), $2, $3)`,
      [randomUUID(), session.userId, replyId],
    );
    const countRes = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM "ReplyLike" WHERE "replyId" = $1`,
      [replyId],
    );
    const count = Number(countRes.rows[0]?.count || 0);
    const likers = await query<{
      id: string;
      firstName: string;
      lastName: string;
    }>(
      `SELECT u.id, u."firstName", u."lastName"
       FROM "ReplyLike" rl
       JOIN "User" u ON u.id = rl."userId"
       WHERE rl."replyId" = $1
       ORDER BY rl."createdAt" DESC
       LIMIT 5`,
      [replyId],
    );
    return NextResponse.json({
      liked: true,
      count,
      likers: likers.rows,
    });
  }
}
