import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth";
import { randomUUID } from "crypto";
import { query } from "@/lib/db";
import { uploadPostImage } from "@/lib/cloudinary";

// GET /api/posts - list public posts + author's private posts
export async function GET(req: NextRequest) {
  const session = await getSessionUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const take = 10;

  const cursorRes = cursor
    ? await query<{ createdAt: Date }>(
        `SELECT "createdAt" FROM "Post" WHERE id = $1 LIMIT 1`,
        [cursor],
      )
    : null;

  const cursorCreatedAt = cursorRes?.rows[0]?.createdAt;

  const postsRes = await query<{
    id: string;
    text: string;
    imageUrl: string | null;
    visibility: string;
    createdAt: Date;
    updatedAt: Date;
    authorId: string;
    authorFirstName: string;
    authorLastName: string;
    authorAvatar: string | null;
    commentCount: string;
  }>(
    cursor && cursorCreatedAt
      ? `SELECT p.id, p.text, p."imageUrl", p.visibility, p."createdAt", p."updatedAt", p."authorId",
                u."firstName" AS "authorFirstName", u."lastName" AS "authorLastName", u.avatar AS "authorAvatar",
                (SELECT COUNT(*)::text FROM "Comment" c WHERE c."postId" = p.id) AS "commentCount"
         FROM "Post" p
         JOIN "User" u ON u.id = p."authorId"
         WHERE (p.visibility = 'public' OR p."authorId" = $1)
           AND (p."createdAt" < $2 OR (p."createdAt" = $2 AND p.id < $3))
         ORDER BY p."createdAt" DESC, p.id DESC
         LIMIT $4`
      : `SELECT p.id, p.text, p."imageUrl", p.visibility, p."createdAt", p."updatedAt", p."authorId",
                u."firstName" AS "authorFirstName", u."lastName" AS "authorLastName", u.avatar AS "authorAvatar",
                (SELECT COUNT(*)::text FROM "Comment" c WHERE c."postId" = p.id) AS "commentCount"
         FROM "Post" p
         JOIN "User" u ON u.id = p."authorId"
         WHERE (p.visibility = 'public' OR p."authorId" = $1)
         ORDER BY p."createdAt" DESC, p.id DESC
         LIMIT $2`,
    cursor && cursorCreatedAt
      ? [session.userId, cursorCreatedAt, cursor, take]
      : [session.userId, take],
  );

  const posts = await Promise.all(
    postsRes.rows.map(async (p: (typeof postsRes.rows)[number]) => {
      const likesRes = await query<{
        userId: string;
        id: string;
        firstName: string;
        lastName: string;
        avatar: string | null;
      }>(
        `SELECT pl."userId", u.id, u."firstName", u."lastName", u.avatar
         FROM "PostLike" pl
         JOIN "User" u ON u.id = pl."userId"
         WHERE pl."postId" = $1
         ORDER BY pl."createdAt" DESC
         LIMIT 5`,
        [p.id],
      );

      return {
        id: p.id,
        text: p.text,
        imageUrl: p.imageUrl,
        visibility: p.visibility,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        authorId: p.authorId,
        author: {
          id: p.authorId,
          firstName: p.authorFirstName,
          lastName: p.authorLastName,
          avatar: p.authorAvatar,
        },
        likes: likesRes.rows.map((l: (typeof likesRes.rows)[number]) => ({
          userId: l.userId,
          user: {
            id: l.id,
            firstName: l.firstName,
            lastName: l.lastName,
            avatar: l.avatar,
          },
        })),
        _count: { comments: Number(p.commentCount || 0) },
      };
    }),
  );

  const nextCursor = posts.length === take ? posts[posts.length - 1].id : null;

  return NextResponse.json({ posts, nextCursor });
}

// POST /api/posts - create a post (multipart for image)
export async function POST(req: NextRequest) {
  const session = await getSessionUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const text = (formData.get("text") as string)?.trim();
    const visibility = (formData.get("visibility") as string) || "public";
    const image = formData.get("image") as File | null;

    if (!text && !image) {
      return NextResponse.json(
        { error: "Post must have text or an image" },
        { status: 400 },
      );
    }

    if (visibility !== "public" && visibility !== "private") {
      return NextResponse.json(
        { error: "visibility must be public or private" },
        { status: 400 },
      );
    }

    let imageUrl: string | null = null;
    if (image && image.size > 0) {
      if (image.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image must be under 10 MB" },
          { status: 400 },
        );
      }
      const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowed.includes(image.type)) {
        return NextResponse.json(
          { error: "Only JPEG, PNG, GIF, WEBP allowed" },
          { status: 400 },
        );
      }
      const bytes = await image.arrayBuffer();
      imageUrl = await uploadPostImage(Buffer.from(bytes), randomUUID());
    }

    const postId = randomUUID();

    await query(
      `INSERT INTO "Post" (id, text, "imageUrl", visibility, "createdAt", "updatedAt", "authorId")
       VALUES ($1, $2, $3, $4, NOW(), NOW(), $5)`,
      [postId, text || "", imageUrl, visibility, session.userId],
    );

    const postRes = await query<{
      id: string;
      text: string;
      imageUrl: string | null;
      visibility: string;
      createdAt: Date;
      updatedAt: Date;
      authorId: string;
      authorFirstName: string;
      authorLastName: string;
      authorAvatar: string | null;
    }>(
      `SELECT p.id, p.text, p."imageUrl", p.visibility, p."createdAt", p."updatedAt", p."authorId",
              u."firstName" AS "authorFirstName", u."lastName" AS "authorLastName", u.avatar AS "authorAvatar"
       FROM "Post" p
       JOIN "User" u ON u.id = p."authorId"
       WHERE p.id = $1
       LIMIT 1`,
      [postId],
    );

    const p = postRes.rows[0];
    const post = {
      id: p.id,
      text: p.text,
      imageUrl: p.imageUrl,
      visibility: p.visibility,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      authorId: p.authorId,
      author: {
        id: p.authorId,
        firstName: p.authorFirstName,
        lastName: p.authorLastName,
        avatar: p.authorAvatar,
      },
      likes: [],
      _count: { comments: 0 },
    };

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("[CREATE_POST]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
