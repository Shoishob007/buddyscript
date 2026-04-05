import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth";
import { query } from "@/lib/db";
import { randomUUID } from "crypto";

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

  const commentsRes = await query<{
    id: string;
    text: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  }>(
    `SELECT c.id, c.text, c."createdAt", c."updatedAt", c."userId",
            u."firstName", u."lastName", u.avatar
     FROM "Comment" c
     JOIN "User" u ON u.id = c."userId"
     WHERE c."postId" = $1
     ORDER BY c."createdAt" ASC`,
    [postId],
  );

  const comments = await Promise.all(
    commentsRes.rows.map(async (c) => {
      const likesRes = await query<{ userId: string }>(
        `SELECT "userId" FROM "CommentLike" WHERE "commentId" = $1`,
        [c.id],
      );

      const repliesRes = await query<{
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
         WHERE r."commentId" = $1
         ORDER BY r."createdAt" ASC`,
        [c.id],
      );

      const replies = await Promise.all(
        repliesRes.rows.map(async (r) => {
          const replyLikesRes = await query<{ userId: string }>(
            `SELECT "userId" FROM "ReplyLike" WHERE "replyId" = $1`,
            [r.id],
          );

          return {
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
            likes: replyLikesRes.rows.map((l) => ({ userId: l.userId })),
          };
        }),
      );

      return {
        id: c.id,
        text: c.text,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        userId: c.userId,
        user: {
          id: c.userId,
          firstName: c.firstName,
          lastName: c.lastName,
          avatar: c.avatar,
        },
        likes: likesRes.rows.map((l) => ({ userId: l.userId })),
        replies,
      };
    }),
  );

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

  const post = await query<{ id: string }>(
    `SELECT id FROM "Post" WHERE id = $1 LIMIT 1`,
    [postId],
  );
  if (!post.rows[0]) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const commentId = randomUUID();
  await query(
    `INSERT INTO "Comment" (id, text, "createdAt", "updatedAt", "userId", "postId")
     VALUES ($1, $2, NOW(), NOW(), $3, $4)`,
    [commentId, text.trim(), session.userId, postId],
  );

  const commentRes = await query<{
    id: string;
    text: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  }>(
    `SELECT c.id, c.text, c."createdAt", c."updatedAt", c."userId",
            u."firstName", u."lastName", u.avatar
     FROM "Comment" c
     JOIN "User" u ON u.id = c."userId"
     WHERE c.id = $1
     LIMIT 1`,
    [commentId],
  );

  const c = commentRes.rows[0];
  const comment = {
    id: c.id,
    text: c.text,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    userId: c.userId,
    user: {
      id: c.userId,
      firstName: c.firstName,
      lastName: c.lastName,
      avatar: c.avatar,
    },
    likes: [],
    replies: [],
  };

  return NextResponse.json({ comment }, { status: 201 });
}
