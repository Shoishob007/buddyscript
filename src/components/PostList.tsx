"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import PostCard from "./PostCard";
import CreatePost from "./CreatePost";

interface User {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
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

interface PostListProps {
    currentUser: User;
}

export default function PostList({ currentUser }: PostListProps) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchPosts = useCallback(async (cursor?: string) => {
        const url = cursor ? `/api/posts?cursor=${cursor}` : "/api/posts";
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            return { posts: data.posts as Post[], nextCursor: data.nextCursor as string | null };
        }
        return null;
    }, []);

    useEffect(() => {
        fetchPosts().then((data) => {
            if (data) {
                setPosts(data.posts);
                setNextCursor(data.nextCursor);
            }
            setLoading(false);
        });
    }, [fetchPosts]);

    async function handlePostCreated() {
        // Refetch from start
        const data = await fetchPosts();
        if (data) {
            setPosts(data.posts);
            setNextCursor(data.nextCursor);
        }
    }

    async function loadMore() {
        if (!nextCursor || loadingMore) return;
        setLoadingMore(true);
        const data = await fetchPosts(nextCursor);
        if (data) {
            setPosts((prev) => [...prev, ...data.posts]);
            setNextCursor(data.nextCursor);
        }
        setLoadingMore(false);
    }

    return (
        <>
            <div className="_feed_inner_ppl_card _mar_b16">
                <div className="_feed_inner_story_arrow">
                    <button type="button" className="_feed_inner_story_arrow_btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="9" height="8" fill="none" viewBox="0 0 9 8">
                            <path fill="#fff" d="M8 4l.366-.341.318.341-.318.341L8 4zm-7 .5a.5.5 0 010-1v1zM5.566.659l2.8 3-.732.682-2.8-3L5.566.66zm2.8 3.682l-2.8 3-.732-.682 2.8-3 .732.682zM8 4.5H1v-1h7v1z" />
                        </svg>
                    </button>
                </div>
                <div className="row">
                    <div className="col-xl-3 col-lg-3 col-md-4 col-sm-4 col">
                        <div className="_feed_inner_profile_story _b_radious6 ">
                            <div className="_feed_inner_profile_story_image">
                                <Image src="/assets/images/card_ppl1.png" alt="Story" width={140} height={180} className="_profile_story_img" />
                                <div className="_feed_inner_story_txt">
                                    <div className="_feed_inner_story_btn">
                                        <button className="_feed_inner_story_btn_link" type="button">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10">
                                                <path stroke="#fff" strokeLinecap="round" d="M.5 4.884h9M4.884 9.5v-9" />
                                            </svg>
                                        </button>
                                    </div>
                                    <p className="_feed_inner_story_para">Your Story</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-lg-3 col-md-4 col-sm-4 col">
                        <div className="_feed_inner_public_story _b_radious6">
                            <div className="_feed_inner_public_story_image">
                                <Image src="/assets/images/card_ppl2.png" alt="Story" width={140} height={180} className="_public_story_img" />
                                <div className="_feed_inner_pulic_story_txt">
                                    <p className="_feed_inner_pulic_story_para">Ryan Roslansky</p>
                                </div>
                                <div className="_feed_inner_public_mini">
                                    <Image src="/assets/images/mini_pic.png" alt="Mini" width={28} height={28} className="_public_mini_img" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-lg-3 col-md-4 col-sm-4 _custom_mobile_none">
                        <div className="_feed_inner_public_story _b_radious6">
                            <div className="_feed_inner_public_story_image">
                                <Image src="/assets/images/card_ppl3.png" alt="Story" width={140} height={180} className="_public_story_img" />
                                <div className="_feed_inner_pulic_story_txt">
                                    <p className="_feed_inner_pulic_story_para">Dylan Field</p>
                                </div>
                                <div className="_feed_inner_public_mini">
                                    <Image src="/assets/images/mini_pic.png" alt="Mini" width={28} height={28} className="_public_mini_img" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-lg-3 col-md-4 col-sm-4 _custom_none">
                        <div className="_feed_inner_public_story _b_radious6">
                            <div className="_feed_inner_public_story_image">
                                <Image src="/assets/images/card_ppl4.png" alt="Story" width={140} height={180} className="_public_story_img" />
                                <div className="_feed_inner_pulic_story_txt">
                                    <p className="_feed_inner_pulic_story_para">Karim Saif</p>
                                </div>
                                <div className="_feed_inner_public_mini">
                                    <Image src="/assets/images/mini_pic.png" alt="Mini" width={28} height={28} className="_public_mini_img" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CreatePost currentUser={currentUser} onPostCreated={handlePostCreated} />

            {loading && (
                <div style={{ textAlign: "center", padding: 24, color: "#999" }}>
                    Loading posts...
                </div>
            )}

            {!loading && posts.length === 0 && (
                <div
                    className="_b_radious6"
                    style={{ textAlign: "center", padding: 40, color: "#999", background: "#fff" }}
                >
                    <p style={{ fontSize: 16, marginBottom: 8 }}>No posts yet.</p>
                    <p style={{ fontSize: 14 }}>Be the first to share something!</p>
                </div>
            )}

            {posts.map((post) => (
                <PostCard key={post.id} post={post} currentUserId={currentUser.id} />
            ))}

            {nextCursor && (
                <div style={{ textAlign: "center", paddingBottom: 24 }}>
                    <button
                        onClick={loadMore}
                        disabled={loadingMore}
                        className="_global_btn _btn_bg"
                        style={{ opacity: loadingMore ? 0.7 : 1, minWidth: 140 }}
                    >
                        {loadingMore ? "Loading..." : "Load More"}
                    </button>
                </div>
            )}
        </>
    );
}
