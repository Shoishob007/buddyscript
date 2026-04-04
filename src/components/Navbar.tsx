"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
}

interface NavbarProps {
    currentUser: User;
}

export default function Navbar({ currentUser }: NavbarProps) {
    const [open, setOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const router = useRouter();

    async function logout() {
        if (loggingOut) return;
        setLoggingOut(true);
        try {
            await fetch("/api/auth/login", { method: "DELETE" });
            router.push("/login");
            router.refresh();
        } finally {
            setLoggingOut(false);
            setOpen(false);
        }
    }

    const initials = `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase();

    return (
        <nav className="navbar navbar-expand-lg navbar-light _header_nav _padd_t10">
            <div className="container _custom_container">
                <div className="_logo_wrap">
                    <Link className="navbar-brand" href="/feed">
                        <Image src="/assets/images/logo.svg" alt="Buddy Script" width={130} height={36} className="_nav_logo" />
                    </Link>
                </div>

                <button
                    className="navbar-toggler bg-light"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <div className="_header_form ms-auto">
                        <form className="_header_form_grp" onSubmit={(e) => e.preventDefault()}>
                            <svg className="_header_form_svg" xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" viewBox="0 0 17 17">
                                <circle cx="7" cy="7" r="6" stroke="#666" />
                                <path stroke="#666" strokeLinecap="round" d="M16 16l-3-3" />
                            </svg>
                            <input className="form-control me-2 _inpt1" type="search" placeholder="Search" aria-label="Search" />
                        </form>
                    </div>

                    <ul className="navbar-nav mb-2 mb-lg-0 _header_nav_list ms-auto _mar_r8">
                        <li className="nav-item _header_nav_item">
                            <Link className="nav-link _header_nav_link_active _header_nav_link" href="/feed" aria-current="page">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="21" fill="none" viewBox="0 0 18 21">
                                    <path className="_home_active" stroke="#000" strokeWidth="1.5" strokeOpacity=".6" d="M1 9.924c0-1.552 0-2.328.314-3.01.313-.682.902-1.187 2.08-2.196l1.143-.98C6.667 1.913 7.732 1 9 1c1.268 0 2.333.913 4.463 2.738l1.142.98c1.179 1.01 1.768 1.514 2.081 2.196.314.682.314 1.458.314 3.01v4.846c0 2.155 0 3.233-.67 3.902-.669.67-1.746.67-3.901.67H5.57c-2.155 0-3.232 0-3.902-.67C1 18.002 1 16.925 1 14.77V9.924z" />
                                    <path className="_home_active" stroke="#000" strokeOpacity=".6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.857 19.341v-5.857a1 1 0 00-1-1H7.143a1 1 0 00-1 1v5.857" />
                                </svg>
                            </Link>
                        </li>
                    </ul>

                    <div className="_header_nav_profile" style={{ position: "relative" }}>
                        <div className="_header_nav_profile_image">
                            {currentUser.avatar ? (
                                <Image src={currentUser.avatar} alt="Profile" width={40} height={40} className="_nav_profile_img" />
                            ) : (
                                <div
                                    className="_nav_profile_img"
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: "50%",
                                        background: "#1890FF",
                                        color: "#fff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 14,
                                        fontWeight: 600,
                                    }}
                                >
                                    {initials}
                                </div>
                            )}
                        </div>
                        <div className="_header_nav_dropdown">
                            <p className="_header_nav_para">
                                {currentUser.firstName} {currentUser.lastName}
                            </p>
                            <button className="_header_nav_dropdown_btn _dropdown_toggle" type="button" onClick={() => setOpen((s) => !s)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="6" fill="none" viewBox="0 0 10 6">
                                    <path fill="#112032" d="M5 5l.354.354L5 5.707l-.354-.353L5 5zm4.354-3.646l-4 4-.708-.708 4-4 .708.708zm-4.708 4l-4-4 .708-.708 4 4-.708.708z" />
                                </svg>
                            </button>
                        </div>

                        {open && (
                            <div className="_nav_profile_dropdown _profile_dropdown" style={{ display: "block", right: 0, left: "auto" }}>
                                <div className="_nav_profile_dropdown_info">
                                    <div className="_nav_profile_dropdown_info_txt">
                                        <h4 className="_nav_dropdown_title">
                                            {currentUser.firstName} {currentUser.lastName}
                                        </h4>
                                        <span className="_nav_drop_profile">Signed in</span>
                                    </div>
                                </div>
                                <hr />
                                <ul className="_nav_dropdown_list">
                                    <li className="_nav_dropdown_list_item">
                                        <button
                                            type="button"
                                            className="_nav_dropdown_link"
                                            onClick={logout}
                                            style={{ width: "100%", background: "transparent", border: "none", textAlign: "left" }}
                                        >
                                            <div className="_nav_drop_info">Log Out</div>
                                            <span className="_nav_drop_btn_link">{loggingOut ? "..." : ">"}</span>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
