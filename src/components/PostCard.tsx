"use client";
import { useState, FormEvent, useRef } from "react";
import Image from "next/image";

interface User {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
}

interface Reply {
    id: string;
    text: string;
    createdAt: string;
    user: User;
    likes: { userId: string }[];
}

interface Comment {
    id: string;
    text: string;
    createdAt: string;
    user: User;
    likes: { userId: string }[];
    replies: Reply[];
}

interface Post {
    id: string;
    text: string;
    imageUrl: string | null;
    visibility: string;
    createdAt: string;
    author: User;
    likes: { userId: string }[];
    _count: { comments: number };
}

interface PostCardProps {
    post: Post;
    currentUserId: string;
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

function Avatar({ user, size = 40 }: { user: User; size?: number }) {
    if (user.avatar) {
        return (
            <Image
                src={user.avatar}
                alt={user.firstName}
                width={size}
                height={size}
                style={{ borderRadius: "50%", objectFit: "cover", width: size, height: size }}
            />
        );
    }
    const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                background: "#1890FF",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: size * 0.35,
                fontWeight: 600,
                flexShrink: 0,
            }}
        >
            {initials}
        </div>
    );
}

function ReplyItem({
    reply,
    currentUserId,
}: {
    reply: Reply;
    currentUserId: string;
}) {
    const [likes, setLikes] = useState(reply.likes);
    const [liking, setLiking] = useState(false);

    const liked = likes.some((l) => l.userId === currentUserId);

    async function toggleLike() {
        if (liking) return;
        setLiking(true);
        try {
            const res = await fetch(`/api/replies/${reply.id}/likes`, { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                setLikes(
                    data.liked
                        ? [...likes, { userId: currentUserId }]
                        : likes.filter((l) => l.userId !== currentUserId)
                );
            }
        } finally {
            setLiking(false);
        }
    }

    return (
        <div className="_comment_main" style={{ marginLeft: 40, marginTop: 8 }}>
            <div className="_comment_image">
                <Avatar user={reply.user} size={32} />
            </div>
            <div className="_comment_area">
                <div className="_comment_details">
                    <div className="_comment_details_top">
                        <div className="_comment_name">
                            <h4 className="_comment_name_title">
                                {reply.user.firstName} {reply.user.lastName}
                            </h4>
                        </div>
                    </div>
                    <div className="_comment_status">
                        <p className="_comment_status_text">
                            <span>{reply.text}</span>
                        </p>
                    </div>
                    {likes.length > 0 && (
                        <div className="_total_reactions">
                            <div className="_total_react">
                                <span className="_reaction_like">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                    </svg>
                                </span>
                            </div>
                            <span className="_total">{likes.length}</span>
                        </div>
                    )}
                    <div className="_comment_reply">
                        <div className="_comment_reply_num">
                            <ul className="_comment_reply_list">
                                <li>
                                    <span
                                        style={{
                                            cursor: "pointer",
                                            color: liked ? "#1890FF" : undefined,
                                            fontWeight: liked ? 600 : undefined,
                                        }}
                                        onClick={toggleLike}
                                    >
                                        Like.
                                    </span>
                                </li>
                                <li>
                                    <span className="_time_link">{timeAgo(reply.createdAt)}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CommentItem({
    comment,
    currentUserId,
}: {
    comment: Comment;
    currentUserId: string;
}) {
    const [likes, setLikes] = useState(comment.likes);
    const [replies, setReplies] = useState(comment.replies);
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [liking, setLiking] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const liked = likes.some((l) => l.userId === currentUserId);

    async function toggleLike() {
        if (liking) return;
        setLiking(true);
        try {
            const res = await fetch(`/api/comments/${comment.id}/likes`, { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                setLikes(
                    data.liked
                        ? [...likes, { userId: currentUserId }]
                        : likes.filter((l) => l.userId !== currentUserId)
                );
            }
        } finally {
            setLiking(false);
        }
    }

    async function submitReply(e: FormEvent) {
        e.preventDefault();
        if (!replyText.trim() || submitting) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/comments/${comment.id}/replies`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: replyText }),
            });
            if (res.ok) {
                const data = await res.json();
                setReplies([...replies, data.reply]);
                setReplyText("");
                setShowReplyBox(false);
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="_comment_main">
            <div className="_comment_image">
                <Avatar user={comment.user} size={36} />
            </div>
            <div className="_comment_area" style={{ flex: 1 }}>
                <div className="_comment_details">
                    <div className="_comment_details_top">
                        <div className="_comment_name">
                            <h4 className="_comment_name_title">
                                {comment.user.firstName} {comment.user.lastName}
                            </h4>
                        </div>
                    </div>
                    <div className="_comment_status">
                        <p className="_comment_status_text">
                            <span>{comment.text}</span>
                        </p>
                    </div>
                    {likes.length > 0 && (
                        <div className="_total_reactions">
                            <div className="_total_react">
                                <span className="_reaction_like">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                    </svg>
                                </span>
                            </div>
                            <span className="_total">{likes.length}</span>
                        </div>
                    )}
                    <div className="_comment_reply">
                        <div className="_comment_reply_num">
                            <ul className="_comment_reply_list">
                                <li>
                                    <span
                                        style={{
                                            cursor: "pointer",
                                            color: liked ? "#1890FF" : undefined,
                                            fontWeight: liked ? 600 : undefined,
                                        }}
                                        onClick={toggleLike}
                                    >
                                        Like.
                                    </span>
                                </li>
                                <li>
                                    <span
                                        style={{ cursor: "pointer" }}
                                        onClick={() => setShowReplyBox(!showReplyBox)}
                                    >
                                        Reply.
                                    </span>
                                </li>
                                <li>
                                    <span className="_time_link">{timeAgo(comment.createdAt)}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Reply input */}
                {showReplyBox && (
                    <form className="_feed_inner_comment_box_form" onSubmit={submitReply} style={{ marginTop: 8 }}>
                        <div className="_feed_inner_comment_box_content">
                            <div className="_feed_inner_comment_box_content_txt" style={{ flex: 1 }}>
                                <textarea
                                    className="form-control _comment_textarea"
                                    placeholder="Write a reply..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            submitReply(e as unknown as FormEvent);
                                        }
                                    }}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    background: "#1890FF",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 4,
                                    padding: "4px 12px",
                                    marginLeft: 8,
                                    cursor: "pointer",
                                }}
                            >
                                {submitting ? "..." : "Reply"}
                            </button>
                        </div>
                    </form>
                )}

                {/* Replies */}
                {replies.map((r) => (
                    <ReplyItem key={r.id} reply={r} currentUserId={currentUserId} />
                ))}
            </div>
        </div>
    );
}

export default function PostCard({ post, currentUserId }: PostCardProps) {
    const [likes, setLikes] = useState(post.likes);
    const [likeCount, setLikeCount] = useState(post.likes.length);
    const [commentCount, setCommentCount] = useState(post._count.comments);
    const shareCount = 0;
    const [comments, setComments] = useState<Comment[]>([]);
    const [showComments, setShowComments] = useState(false);
    const [showAllComments, setShowAllComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [liking, setLiking] = useState(false);
    const [showLikers, setShowLikers] = useState(false);
    const [likers, setLikers] = useState<User[]>([]);

    const commentRef = useRef<HTMLTextAreaElement>(null);

    const liked = likes.some((l) => l.userId === currentUserId);

    async function toggleLike() {
        if (liking) return;
        setLiking(true);
        try {
            const res = await fetch(`/api/posts/${post.id}/likes`, { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                setLikeCount(data.count ?? likeCount);
                setLikes((prev) => (data.liked
                    ? [...prev, { userId: currentUserId }]
                    : prev.filter((l) => l.userId !== currentUserId)));
                if (data.likers) setLikers(data.likers);
            }
        } finally {
            setLiking(false);
        }
    }

    async function fetchLikers() {
        const res = await fetch(`/api/posts/${post.id}/likes`);
        if (res.ok) {
            const data = await res.json();
            setLikers(data.likers);
        }
        setShowLikers(true);
    }

    async function loadComments() {
        if (loadingComments) return;
        setLoadingComments(true);
        try {
            const res = await fetch(`/api/posts/${post.id}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(data.comments);
            }
        } finally {
            setLoadingComments(false);
        }
    }

    async function toggleComments() {
        if (!showComments && comments.length === 0) {
            await loadComments();
        }
        const next = !showComments;
        setShowComments(next);
        if (!next) setShowAllComments(false);
        if (next) {
            setTimeout(() => commentRef.current?.focus(), 100);
        }
    }

    async function submitComment(e: FormEvent) {
        e.preventDefault();
        if (!commentText.trim() || submittingComment) return;
        setSubmittingComment(true);
        try {
            const res = await fetch(`/api/posts/${post.id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: commentText }),
            });
            if (res.ok) {
                const data = await res.json();
                setComments((prev) => [...prev, data.comment]);
                setCommentCount((c) => c + 1);
                setCommentText("");
                setShowComments(true);
            }
        } finally {
            setSubmittingComment(false);
        }
    }

    return (
        <div className="_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16">
            {/* Post header */}
            <div className="_feed_inner_timeline_content _padd_r24 _padd_l24">
                <div className="_feed_inner_timeline_post_top">
                    <div className="_feed_inner_timeline_post_box">
                        <div className="_feed_inner_timeline_post_box_image">
                            <Avatar user={post.author} size={42} />
                        </div>
                        <div className="_feed_inner_timeline_post_box_txt">
                            <h4 className="_feed_inner_timeline_post_box_title">
                                {post.author.firstName} {post.author.lastName}
                            </h4>
                            <p className="_feed_inner_timeline_post_box_para">
                                {timeAgo(post.createdAt)} &middot;{" "}
                                <span style={{ textTransform: "capitalize" }}>
                                    {post.visibility === "private" ? "🔒 Private" : "🌐 Public"}
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className="_feed_inner_timeline_post_box_dropdown">
                        <div className="_feed_timeline_post_dropdown">
                            <button className="_feed_timeline_post_dropdown_link" type="button">
                                <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
                                    <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
                                    <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
                                    <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
                                </svg>
                            </button>
                        </div>
                        <div className="_feed_timeline_dropdown _timeline_dropdown">
                            <ul className="_feed_timeline_dropdown_list">
                                <li className="_feed_timeline_dropdown_item"><a href="#0" className="_feed_timeline_dropdown_link">Save Post</a></li>
                                <li className="_feed_timeline_dropdown_item"><a href="#0" className="_feed_timeline_dropdown_link">Turn On Notification</a></li>
                                <li className="_feed_timeline_dropdown_item"><a href="#0" className="_feed_timeline_dropdown_link">Hide</a></li>
                                <li className="_feed_timeline_dropdown_item"><a href="#0" className="_feed_timeline_dropdown_link">Edit Post</a></li>
                                <li className="_feed_timeline_dropdown_item"><a href="#0" className="_feed_timeline_dropdown_link">Delete Post</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Post content */}
                {post.text && (
                    <h4 className="_feed_inner_timeline_post_title" style={{ marginTop: 12, marginBottom: 8 }}>
                        {post.text}
                    </h4>
                )}
                {post.imageUrl && (
                    <div className="_feed_inner_timeline_image">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={post.imageUrl} alt="Post" className="_time_img" style={{ width: "100%", borderRadius: 8 }} />
                    </div>
                )}
            </div>

            {/* Like/comment counts */}
            <div className="_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26" style={{ marginTop: 12 }}>
                <div
                    className="_feed_inner_timeline_total_reacts_image"
                    style={{ cursor: likeCount > 0 ? "pointer" : "default" }}
                    onClick={likeCount > 0 ? fetchLikers : undefined}
                    title={likeCount > 0 ? "See who liked this" : undefined}
                >
                    {likeCount > 0 && (() => {
                        const reactImages = [
                            { src: "/assets/images/react_img1.png", className: "_react_img1" },
                            { src: "/assets/images/react_img2.png", className: "_react_img" },
                            { src: "/assets/images/react_img3.png", className: "_react_img _rect_img_mbl_none" },
                            { src: "/assets/images/react_img4.png", className: "_react_img _rect_img_mbl_none" },
                            { src: "/assets/images/react_img5.png", className: "_react_img _rect_img_mbl_none" },
                        ];
                        const visible = Math.min(likeCount, 5);
                        return reactImages.slice(0, visible).map((img, i) => (
                            <Image key={i} src={img.src} alt="React" width={18} height={18} className={img.className} />
                        ));
                    })()}
                    {likeCount > 0 && (
                        <p className="_feed_inner_timeline_total_reacts_para">
                            {likeCount > 5 ? `${likeCount}+` : likeCount}
                        </p>
                    )}
                </div>
                <div className="_feed_inner_timeline_total_reacts_txt">
                    <p className="_feed_inner_timeline_total_reacts_para1" style={{ cursor: "pointer" }} onClick={toggleComments}>
                        <span>{commentCount}</span> Comment
                    </p>
                    <p className="_feed_inner_timeline_total_reacts_para2"><span>{shareCount}</span> Share</p>
                </div>
            </div>

            {/* Likers modal */}
            {showLikers && likers.length > 0 && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0,0,0,0.4)",
                        zIndex: 9999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                    onClick={() => setShowLikers(false)}
                >
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: 12,
                            padding: 24,
                            minWidth: 280,
                            maxHeight: "80vh",
                            overflowY: "auto",
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h5 style={{ marginBottom: 16, fontWeight: 600 }}>People who liked this</h5>
                        {likers.map((u) => (
                            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                                <Avatar user={u} size={36} />
                                <span>
                                    {u.firstName} {u.lastName}
                                </span>
                            </div>
                        ))}
                        <button
                            onClick={() => setShowLikers(false)}
                            style={{ marginTop: 16, width: "100%", padding: "8px", background: "#1890FF", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Reaction buttons */}
            <div className="_feed_inner_timeline_reaction">
                <button
                    className={`_feed_inner_timeline_reaction_emoji _feed_reaction ${liked ? "_feed_reaction_active" : ""}`}
                    onClick={toggleLike}
                    disabled={liking}
                >
                    <span className="_feed_inner_timeline_reaction_link" style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" fill="none" viewBox="0 0 19 19">
                                {liked ? (
                                    <path
                                        fill="#1890FF"
                                        d="M7.944 17.917c-.637 0-1.152-.509-1.152-1.137V9.89c0-.628.515-1.137 1.152-1.137h2.073c.278 0 .532-.157.65-.403l1.56-3.219c.22-.454.739-.693 1.23-.567.492.126.814.581.764 1.08l-.297 2.927h2.44c.64 0 1.17.497 1.193 1.123a1.13 1.13 0 01-.023.245l-1.178 6.776a1.157 1.157 0 01-1.14.962H7.944zM2.74 9.437c-.64 0-1.157.511-1.157 1.14v6.196c0 .629.518 1.14 1.158 1.14h1.484c.64 0 1.158-.511 1.158-1.14v-6.196c0-.629-.518-1.14-1.158-1.14H2.74z"
                                    />
                                ) : (
                                    <path
                                        stroke="#666"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M7.944 17.917h7.162c.56 0 1.04-.392 1.133-.938l1.178-6.776a1.14 1.14 0 00-1.132-1.333h-3.36l.37-3.65a1.132 1.132 0 00-2.152-.632l-1.56 3.22a1.153 1.153 0 01-1.04.645h-.599c-.637 0-1.152.509-1.152 1.137v6.89c0 .628.515 1.137 1.152 1.137zM2.74 9.437h1.484c.64 0 1.158.511 1.158 1.14v6.196c0 .629-.518 1.14-1.158 1.14H2.74c-.64 0-1.157-.511-1.157-1.14v-6.196c0-.629.518-1.14 1.158-1.14z"
                                    />
                                )}
                            </svg>
                            {liked ? "Liked" : "Like"}
                        </span>
                    </span>
                </button>
                <button
                    className="_feed_inner_timeline_reaction_comment _feed_reaction"
                    onClick={toggleComments}
                >
                    <span className="_feed_inner_timeline_reaction_link" style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                            <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="none" viewBox="0 0 21 21">
                                <path stroke="#000" d="M1 10.5c0-.464 0-.696.009-.893A9 9 0 019.607 1.01C9.804 1 10.036 1 10.5 1c.464 0 .696 0 .893.009a9 9 0 018.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 01-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 01-8.598-8.598C1 11.196 1 10.964 1 10.5z" />
                                <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" d="M6.938 9.313h7.125M10.5 14.063h3.563" />
                            </svg>
                            Comment
                        </span>
                    </span>
                </button>
                <button className="_feed_inner_timeline_reaction_share _feed_reaction" type="button">
                    <span className="_feed_inner_timeline_reaction_link" style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                            <svg className="_reaction_svg" xmlns="http://www.w3.org/2000/svg" width="24" height="21" fill="none" viewBox="0 0 24 21">
                                <path stroke="#000" strokeLinejoin="round" d="M23 10.5L12.917 1v5.429C3.267 6.429 1 13.258 1 20c2.785-3.52 5.248-5.429 11.917-5.429V20L23 10.5z" />
                            </svg>
                            Share
                        </span>
                    </span>
                </button>
            </div>

            {/* Comment section */}
            {showComments && (
                <div className="_feed_inner_timeline_cooment_area">
                    {/* Comment input */}
                    <div className="_feed_inner_comment_box">
                        <form className="_feed_inner_comment_box_form" onSubmit={submitComment}>
                            <div className="_feed_inner_comment_box_content">
                                <div className="_feed_inner_comment_box_content_txt" style={{ flex: 1 }}>
                                    <textarea
                                        ref={commentRef}
                                        className="form-control _comment_textarea"
                                        placeholder="Write a comment..."
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        rows={1}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                submitComment(e as unknown as FormEvent);
                                            }
                                        }}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={submittingComment}
                                    className="_feed_inner_comment_box_icon_btn"
                                    style={{
                                        background: "#1890FF",
                                        color: "#fff",
                                        borderRadius: 4,
                                        border: "none",
                                        padding: "4px 12px",
                                        marginLeft: 8,
                                        cursor: "pointer",
                                    }}
                                >
                                    {submittingComment ? "..." : "Post"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Comments list */}
                    <div className="_timline_comment_main">
                        {loadingComments && (
                            <p style={{ padding: "8px 24px", color: "#999", fontSize: 14 }}>Loading comments...</p>
                        )}
                        {!loadingComments && comments.length > 0 && (
                            <>
                                {comments.length > 1 && !showAllComments && (
                                    <div className="_previous_comment" style={{ padding: "6px 24px" }}>
                                        <button
                                            type="button"
                                            className="_previous_comment_txt"
                                            onClick={() => setShowAllComments(true)}
                                        >
                                            View {comments.length - 1} previous comment{comments.length - 1 > 1 ? "s" : ""}
                                        </button>
                                    </div>
                                )}
                                {(showAllComments ? comments : [comments[comments.length - 1]]).map((c) => (
                                    <CommentItem key={c.id} comment={c} currentUserId={currentUserId} />
                                ))}
                            </>
                        )}
                        {!loadingComments && comments.length === 0 && (
                            <p style={{ padding: "8px 24px", color: "#999", fontSize: 14 }}>
                                No comments yet. Be the first!
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
