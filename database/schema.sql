CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    avatar TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Post" (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    "imageUrl" TEXT,
    visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "authorId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "PostLike" (
    id TEXT PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "postId" TEXT NOT NULL REFERENCES "Post"(id) ON DELETE CASCADE,
    UNIQUE ("userId", "postId")
);

CREATE TABLE IF NOT EXISTS "Comment" (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "postId" TEXT NOT NULL REFERENCES "Post"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "CommentLike" (
    id TEXT PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "commentId" TEXT NOT NULL REFERENCES "Comment"(id) ON DELETE CASCADE,
    UNIQUE ("userId", "commentId")
);

CREATE TABLE IF NOT EXISTS "Reply" (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "commentId" TEXT NOT NULL REFERENCES "Comment"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "ReplyLike" (
    id TEXT PRIMARY KEY,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
    "replyId" TEXT NOT NULL REFERENCES "Reply"(id) ON DELETE CASCADE,
    UNIQUE ("userId", "replyId")
);

CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"(email);
CREATE INDEX IF NOT EXISTS "Post_authorId_idx" ON "Post"("authorId");
CREATE INDEX IF NOT EXISTS "Post_createdAt_idx" ON "Post"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Post_visibility_idx" ON "Post"(visibility);
CREATE INDEX IF NOT EXISTS "Comment_postId_idx" ON "Comment"("postId");
CREATE INDEX IF NOT EXISTS "Comment_createdAt_idx" ON "Comment"("createdAt");
CREATE INDEX IF NOT EXISTS "Reply_commentId_idx" ON "Reply"("commentId");
CREATE INDEX IF NOT EXISTS "PostLike_postId_idx" ON "PostLike"("postId");
CREATE INDEX IF NOT EXISTS "PostLike_userId_idx" ON "PostLike"("userId");
CREATE INDEX IF NOT EXISTS "CommentLike_commentId_idx" ON "CommentLike"("commentId");
CREATE INDEX IF NOT EXISTS "ReplyLike_replyId_idx" ON "ReplyLike"("replyId");
