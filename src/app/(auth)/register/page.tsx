"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");

        if (password !== confirm) {
            setError("Passwords do not match");
            return;
        }
        if (!agreed) {
            setError("You must agree to the terms & conditions");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ firstName, lastName, email, password }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "Registration failed");
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
        <section className="_social_registration_wrapper _layout_main_wrapper">
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

            <div className="_social_registration_wrap">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-xl-8 col-lg-8 col-md-12 col-sm-12">
                            <div className="_social_registration_right">
                                <div className="_social_registration_right_image">
                                    <Image src="/assets/images/registration.png" alt="Register" width={620} height={480} style={{ width: "100%", height: "auto" }} />
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-lg-4 col-md-12 col-sm-12">
                            <div className="_social_registration_content">
                                <div className="_social_registration_right_logo _mar_b28">
                                    <Image src="/assets/images/logo.svg" alt="Buddy Script" width={140} height={40} className="_right_logo" />
                                </div>
                                <p className="_social_registration_content_para _mar_b8">Get Started Now</p>
                                <h4 className="_social_registration_content_title _titl4 _mar_b50">Registration</h4>

                                {error && (
                                    <div className="alert alert-danger py-2 mb-3" role="alert" style={{ fontSize: 14 }}>
                                        {error}
                                    </div>
                                )}

                                <form className="_social_registration_form" onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-xl-6 col-lg-12 col-md-6 col-sm-12">
                                            <div className="_social_registration_form_input _mar_b14">
                                                <label className="_social_registration_label _mar_b8">First Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control _social_registration_input"
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                    required
                                                    autoComplete="given-name"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-xl-6 col-lg-12 col-md-6 col-sm-12">
                                            <div className="_social_registration_form_input _mar_b14">
                                                <label className="_social_registration_label _mar_b8">Last Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control _social_registration_input"
                                                    value={lastName}
                                                    onChange={(e) => setLastName(e.target.value)}
                                                    required
                                                    autoComplete="family-name"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-xl-12">
                                            <div className="_social_registration_form_input _mar_b14">
                                                <label className="_social_registration_label _mar_b8">Email</label>
                                                <input
                                                    type="email"
                                                    className="form-control _social_registration_input"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    autoComplete="email"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-xl-12">
                                            <div className="_social_registration_form_input _mar_b14">
                                                <label className="_social_registration_label _mar_b8">Password</label>
                                                <input
                                                    type="password"
                                                    className="form-control _social_registration_input"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    minLength={8}
                                                    autoComplete="new-password"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-xl-12">
                                            <div className="_social_registration_form_input _mar_b14">
                                                <label className="_social_registration_label _mar_b8">Repeat Password</label>
                                                <input
                                                    type="password"
                                                    className="form-control _social_registration_input"
                                                    value={confirm}
                                                    onChange={(e) => setConfirm(e.target.value)}
                                                    required
                                                    autoComplete="new-password"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-12">
                                            <div className="form-check _social_registration_form_check">
                                                <input
                                                    className="form-check-input _social_registration_form_check_input"
                                                    type="checkbox"
                                                    id="terms"
                                                    checked={agreed}
                                                    onChange={(e) => setAgreed(e.target.checked)}
                                                />
                                                <label className="form-check-label _social_registration_form_check_label" htmlFor="terms">
                                                    I agree to terms &amp; conditions
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-lg-12">
                                            <div className="_social_registration_form_btn _mar_t40 _mar_b60">
                                                <button
                                                    type="submit"
                                                    className="_social_registration_form_btn_link _btn1"
                                                    disabled={loading}
                                                    style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
                                                >
                                                    {loading ? "Creating account..." : "Register now"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                                <div className="row">
                                    <div className="col-xl-12">
                                        <div className="_social_registration_bottom_txt">
                                            <p className="_social_registration_bottom_txt_para">
                                                Already have an account?{" "}
                                                <Link href="/login">Login</Link>
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
