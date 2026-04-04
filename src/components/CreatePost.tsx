"use client";
import { useState, useRef, FormEvent } from "react";
import Image from "next/image";

interface User {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
}

interface CreatePostProps {
    currentUser: User;
    onPostCreated: () => void;
}

export default function CreatePost({ currentUser, onPostCreated }: CreatePostProps) {
    const [text, setText] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [visibility, setVisibility] = useState<"public" | "private">("public");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            setError("Image must be under 10MB");
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setError("");
    }

    function removeImage() {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!text.trim() && !imageFile) {
            setError("Please write something or add an image.");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            const fd = new FormData();
            fd.append("text", text);
            fd.append("visibility", visibility);
            if (imageFile) fd.append("image", imageFile);

            const res = await fetch("/api/posts", { method: "POST", body: fd });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Failed to post");
                return;
            }
            setText("");
            removeImage();
            onPostCreated();
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    const initials = `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase();

    return (
        <div className="_feed_inner_text_area _b_radious6 _padd_b24 _padd_t24 _padd_r24 _padd_l24 _mar_b16">
            <form onSubmit={handleSubmit}>
                <div className="_feed_inner_text_area_box">
                    <div className="_feed_inner_text_area_box_image">
                        {currentUser.avatar ? (
                            <Image
                                src={currentUser.avatar}
                                alt="avatar"
                                width={48}
                                height={48}
                                className="_txt_img"
                                style={{ borderRadius: "50%", objectFit: "cover" }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: "50%",
                                    background: "#1890FF",
                                    color: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 600,
                                    fontSize: 16,
                                    flexShrink: 0,
                                }}
                            >
                                {initials}
                            </div>
                        )}
                    </div>

                    <div className="form-floating _feed_inner_text_area_box_form" style={{ flex: 1 }}>
                        <textarea
                            className="form-control _textarea"
                            id="postTextarea"
                            placeholder="Write something ..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            style={{ minHeight: 80, resize: "none" }}
                        />
                        <label className="_feed_textarea_label" htmlFor="postTextarea">
                            Write something ...
                            <svg xmlns="http://www.w3.org/2000/svg" width="23" height="24" fill="none" viewBox="0 0 23 24">
                                <path fill="#666" d="M19.504 19.209c.332 0 .601.289.601.646 0 .326-.226.596-.52.64l-.081.005h-6.276c-.332 0-.602-.289-.602-.645 0-.327.227-.597.52-.64l.082-.006h6.276zM13.4 4.417c1.139-1.223 2.986-1.223 4.125 0l1.182 1.268c1.14 1.223 1.14 3.205 0 4.427L9.82 19.649a2.619 2.619 0 01-1.916.85h-3.64c-.337 0-.61-.298-.6-.66l.09-3.941a3.019 3.019 0 01.794-1.982l8.852-9.5zm-.688 2.562l-7.313 7.85a1.68 1.68 0 00-.441 1.101l-.077 3.278h3.023c.356 0 .698-.133.968-.376l.098-.096 7.35-7.887-3.608-3.87zm3.962-1.65a1.633 1.633 0 00-2.423 0l-.688.737 3.606 3.87.688-.737c.631-.678.666-1.755.105-2.477l-.105-.124-1.183-1.268z" />
                            </svg>
                        </label>
                    </div>
                </div>

                {imagePreview && (
                    <div style={{ position: "relative", marginTop: 10 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={imagePreview}
                            alt="preview"
                            style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 8, objectFit: "cover" }}
                        />
                        <button
                            type="button"
                            onClick={removeImage}
                            style={{
                                position: "absolute",
                                top: 6,
                                right: 6,
                                background: "rgba(0,0,0,0.6)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "50%",
                                width: 26,
                                height: 26,
                                cursor: "pointer",
                                fontSize: 14,
                                lineHeight: 1,
                            }}
                        >
                            x
                        </button>
                    </div>
                )}

                {error && <p style={{ color: "#e74c3c", fontSize: 13, marginTop: 8 }}>{error}</p>}

                <div className="_feed_inner_text_area_bottom" style={{ marginTop: 12 }}>
                    <div className="_feed_inner_text_area_item">
                        <div className="_feed_inner_text_area_bottom_photo _feed_common">
                            <button
                                type="button"
                                className="_feed_inner_text_area_bottom_photo_link"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                                        <path fill="#666" d="M13.916 0c3.109 0 5.18 2.429 5.18 5.914v8.17c0 3.486-2.072 5.916-5.18 5.916H5.999C2.89 20 .827 17.572.827 14.085v-8.17C.827 2.43 2.897 0 6 0h7.917z" />
                                    </svg>
                                </span>
                                Photo
                            </button>
                        </div>

                        <div className="_feed_inner_text_area_bottom_video _feed_common">
                            <button type="button" className="_feed_inner_text_area_bottom_photo_link">
                                <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24">
                                        <path fill="#666" d="M11.485 4.5c2.213 0 3.753 1.534 3.917 3.784l2.418-1.082c1.047-.468 2.188.327 2.271 1.533l.005.141v6.64c0 1.237-1.103 2.093-2.155 1.72l-.121-.047-2.418-1.083c-.164 2.25-1.708 3.785-3.917 3.785H5.76c-2.343 0-3.932-1.72-3.932-4.188V8.688c0-2.47 1.589-4.188 3.932-4.188h5.726z" />
                                    </svg>
                                </span>
                                Video
                            </button>
                        </div>

                        <div className="_feed_inner_text_area_bottom_event _feed_common">
                            <button type="button" className="_feed_inner_text_area_bottom_photo_link">
                                <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24">
                                        <path fill="#666" d="M14.371 2c.32 0 .585.262.627.603l.005.095v.788c2.598.195 4.188 2.033 4.18 5v8.488c0 3.145-1.786 5.026-4.656 5.026H7.395C4.53 22 2.74 20.087 2.74 16.904V8.486c0-2.966 1.596-4.804 4.187-5v-.788c0-.386.283-.698.633-.698.32 0 .584.262.626.603l.006.095v.771h5.546v-.771c0-.386.284-.698.633-.698z" />
                                    </svg>
                                </span>
                                Event
                            </button>
                        </div>

                        <div className="_feed_inner_text_area_bottom_article _feed_common">
                            <button type="button" className="_feed_inner_text_area_bottom_photo_link">
                                <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" fill="none" viewBox="0 0 18 20">
                                        <path fill="#666" d="M12.49 0c2.92 0 4.665 1.92 4.693 5.132v9.659c0 3.257-1.75 5.209-4.693 5.209H5.434c-.377 0-.734-.032-1.07-.095l-.2-.041C2 19.371.74 17.555.74 14.791V5.209c0-.334.019-.654.055-.96C1.114 1.564 2.799 0 5.434 0h7.056z" />
                                    </svg>
                                </span>
                                Article
                            </button>
                        </div>
                    </div>

                    <div className="_feed_inner_text_area_btn">
                        <button type="submit" className="_feed_inner_text_area_btn_link" disabled={submitting}>
                            <svg className="_mar_img" xmlns="http://www.w3.org/2000/svg" width="14" height="13" fill="none" viewBox="0 0 14 13">
                                <path fill="#fff" fillRule="evenodd" d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88zM9.097 13c-.464 0-.89-.236-1.14-.641L5.372 8.165l-4.237-2.65a1.336 1.336 0 01-.622-1.331c.074-.536.441-.96.957-1.112L11.774.054a1.347 1.347 0 011.67 1.682l-3.05 10.296A1.332 1.332 0 019.098 13z" clipRule="evenodd" />
                            </svg>
                            <span>{submitting ? "Posting..." : "Post"}</span>
                        </button>
                    </div>
                </div>

                <div className="_feed_inner_text_area_bottom_mobile">
                    <div className="_feed_inner_text_mobile">
                        <div className="_feed_inner_text_area_item">
                            <div className="_feed_inner_text_area_bottom_photo _feed_common">
                                <button
                                    type="button"
                                    className="_feed_inner_text_area_bottom_photo_link"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20">
                                            <path fill="#666" d="M13.916 0c3.109 0 5.18 2.429 5.18 5.914v8.17c0 3.486-2.072 5.916-5.18 5.916H5.999C2.89 20 .827 17.572.827 14.085v-8.17C.827 2.43 2.897 0 6 0h7.917z" />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                            <div className="_feed_inner_text_area_bottom_video _feed_common">
                                <button type="button" className="_feed_inner_text_area_bottom_photo_link">
                                    <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24">
                                            <path fill="#666" d="M11.485 4.5c2.213 0 3.753 1.534 3.917 3.784l2.418-1.082c1.047-.468 2.188.327 2.271 1.533l.005.141v6.64c0 1.237-1.103 2.093-2.155 1.72l-.121-.047-2.418-1.083c-.164 2.25-1.708 3.785-3.917 3.785H5.76c-2.343 0-3.932-1.72-3.932-4.188V8.688c0-2.47 1.589-4.188 3.932-4.188h5.726z" />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                            <div className="_feed_inner_text_area_bottom_event _feed_common">
                                <button type="button" className="_feed_inner_text_area_bottom_photo_link">
                                    <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="24" fill="none" viewBox="0 0 22 24">
                                            <path fill="#666" d="M14.371 2c.32 0 .585.262.627.603l.005.095v.788c2.598.195 4.188 2.033 4.18 5v8.488c0 3.145-1.786 5.026-4.656 5.026H7.395C4.53 22 2.74 20.087 2.74 16.904V8.486c0-2.966 1.596-4.804 4.187-5v-.788c0-.386.283-.698.633-.698.32 0 .584.262.626.603l.006.095v.771h5.546v-.771c0-.386.284-.698.633-.698z" />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                            <div className="_feed_inner_text_area_bottom_article _feed_common">
                                <button type="button" className="_feed_inner_text_area_bottom_photo_link">
                                    <span className="_feed_inner_text_area_bottom_photo_iamge _mar_img">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="20" fill="none" viewBox="0 0 18 20">
                                            <path fill="#666" d="M12.49 0c2.92 0 4.665 1.92 4.693 5.132v9.659c0 3.257-1.75 5.209-4.693 5.209H5.434c-.377 0-.734-.032-1.07-.095l-.2-.041C2 19.371.74 17.555.74 14.791V5.209c0-.334.019-.654.055-.96C1.114 1.564 2.799 0 5.434 0h7.056z" />
                                        </svg>
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="_feed_inner_text_area_btn">
                            <button type="submit" className="_feed_inner_text_area_btn_link" disabled={submitting}>
                                <svg className="_mar_img" xmlns="http://www.w3.org/2000/svg" width="14" height="13" fill="none" viewBox="0 0 14 13">
                                    <path fill="#fff" fillRule="evenodd" d="M6.37 7.879l2.438 3.955a.335.335 0 00.34.162c.068-.01.23-.05.289-.247l3.049-10.297a.348.348 0 00-.09-.35.341.341 0 00-.34-.088L1.75 4.03a.34.34 0 00-.247.289.343.343 0 00.16.347L5.666 7.17 9.2 3.597a.5.5 0 01.712.703L6.37 7.88zM9.097 13c-.464 0-.89-.236-1.14-.641L5.372 8.165l-4.237-2.65a1.336 1.336 0 01-.622-1.331c.074-.536.441-.96.957-1.112L11.774.054a1.347 1.347 0 011.67 1.682l-3.05 10.296A1.332 1.332 0 019.098 13z" clipRule="evenodd" />
                                </svg>
                                <span>{submitting ? "Posting..." : "Post"}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                />
            </form>
        </div>
    );
}
