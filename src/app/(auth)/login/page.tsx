"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Login failed");
                return;
            }

            router.push("/feed");
            router.refresh();
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="_social_login_wrapper _layout_main_wrapper">
            <div className="_shape_one">
                <Image src="/assets/images/shape1.svg" alt="" width={300} height={300} className="_shape_img" />
                <Image src="/assets/images/dark_shape.svg" alt="" width={300} height={300} className="_dark_shape" />
            </div>
            <div className="_shape_two">
                <Image src="/assets/images/shape2.svg" alt="" width={300} height={300} className="_shape_img" />
                <Image src="/assets/images/dark_shape1.svg" alt="" width={300} height={300} className="_dark_shape _dark_shape_opacity" />
            </div>
            <div className="_shape_three">
                <Image src="/assets/images/shape3.svg" alt="" width={200} height={200} className="_shape_img" />
                <Image src="/assets/images/dark_shape2.svg" alt="" width={200} height={200} className="_dark_shape _dark_shape_opacity" />
            </div>

            <div className="_social_login_wrap">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
                            <div className="_social_login_left">
                                <div className="_social_login_left_image">
                                    <Image src="/assets/images/login.png" alt="Login" width={620} height={480} className="_left_img" style={{ width: "100%", height: "auto" }} />
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
                            <div className="_social_login_content">
                                <div className="_social_login_left_logo _mar_b28">
                                    <Image src="/assets/images/logo.svg" alt="Buddy Script" width={140} height={40} className="_left_logo" />
                                </div>
                                <p className="_social_login_content_para _mar_b8">Welcome back</p>
                                <h4 className="_social_login_content_title _titl4 _mar_b50">Login to your account</h4>

                                <button type="button" className="_social_login_content_btn _mar_b40" style={{ width: "100%" }}>
                                    <Image src="/assets/images/google.svg" alt="Google" width={20} height={20} className="_google_img" /> <span>Or sign-in with google</span>
                                </button>
                                <div className="_social_login_content_bottom_txt _mar_b40"> <span>Or</span>
                                </div>

                                {error && (
                                    <div className="alert alert-danger py-2 mb-3" role="alert" style={{ fontSize: 14 }}>
                                        {error}
                                    </div>
                                )}

                                <form className="_social_login_form" onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-xl-12">
                                            <div className="_social_login_form_input _mar_b14">
                                                <label className="_social_login_label _mar_b8">Email</label>
                                                <input
                                                    type="email"
                                                    className="form-control _social_login_input"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    autoComplete="email"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-xl-12">
                                            <div className="_social_login_form_input _mar_b14">
                                                <label className="_social_login_label _mar_b8">Password</label>
                                                <input
                                                    type="password"
                                                    className="form-control _social_login_input"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    autoComplete="current-password"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-6 col-md-6 col-sm-12">
                                            <div className="form-check _social_login_form_check">
                                                <input
                                                    className="form-check-input _social_login_form_check_input"
                                                    type="checkbox"
                                                    id="rememberMe"
                                                    checked={remember}
                                                    onChange={(e) => setRemember(e.target.checked)}
                                                />
                                                <label className="form-check-label _social_login_form_check_label" htmlFor="rememberMe">
                                                    Remember me
                                                </label>
                                            </div>
                                        </div>
                                        <div className="col-lg-6 col-md-6 col-sm-12">
                                            <div className="_social_login_form_left">
                                                <p className="_social_login_form_left_para">Forgot password?</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-12">
                                            <div className="_social_login_form_btn _mar_t40 _mar_b60">
                                                <button
                                                    type="submit"
                                                    className="_social_login_form_btn_link _btn1"
                                                    disabled={loading}
                                                    style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                                                >
                                                    {loading ? "Logging in..." : "Login now"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                                <div className="row">
                                    <div className="col-xl-12">
                                        <div className="_social_login_bottom_txt">
                                            <p className="_social_login_bottom_txt_para">
                                                Don&apos;t have an account?{" "}
                                                <Link href="/register">Create New Account</Link>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
