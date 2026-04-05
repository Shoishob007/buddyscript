import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth";
import { query } from "@/lib/db";
import { randomUUID } from "crypto";

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

  const postRes = await query<{
    id: string;
    visibility: string;
    authorId: string;
  }>(`SELECT id, visibility, "authorId" FROM "Post" WHERE id = $1 LIMIT 1`, [
    postId,
  ]);
  const post = postRes.rows[0];
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Only can like public posts or own posts
  if (post.visibility === "private" && post.authorId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existingRes = await query<{ id: string }>(
    `SELECT id FROM "PostLike" WHERE "userId" = $1 AND "postId" = $2 LIMIT 1`,
    [session.userId, postId],
  );
  const existing = existingRes.rows[0];

  if (existing) {
    await query(`DELETE FROM "PostLike" WHERE id = $1`, [existing.id]);
    const countRes = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM "PostLike" WHERE "postId" = $1`,
      [postId],
    );
    const count = Number(countRes.rows[0]?.count || 0);
    return NextResponse.json({ liked: false, count });
  } else {
    await query(
      `INSERT INTO "PostLike" (id, "createdAt", "userId", "postId") VALUES ($1, NOW(), $2, $3)`,
      [randomUUID(), session.userId, postId],
    );
    const countRes = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM "PostLike" WHERE "postId" = $1`,
      [postId],
    );
    const count = Number(countRes.rows[0]?.count || 0);
    // Get likers for display
    const likers = await query<{
      id: string;
      firstName: string;
      lastName: string;
      avatar: string | null;
    }>(
      `SELECT u.id, u."firstName", u."lastName", u.avatar
       FROM "PostLike" pl
       JOIN "User" u ON u.id = pl."userId"
       WHERE pl."postId" = $1
       ORDER BY pl."createdAt" DESC
       LIMIT 5`,
      [postId],
    );
    return NextResponse.json({
      liked: true,
      count,
      likers: likers.rows,
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
  const likers = await query<{
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  }>(
    `SELECT u.id, u."firstName", u."lastName", u.avatar
     FROM "PostLike" pl
     JOIN "User" u ON u.id = pl."userId"
     WHERE pl."postId" = $1
     ORDER BY pl."createdAt" DESC`,
    [postId],
  );
  return NextResponse.json({ likers: likers.rows });
}
