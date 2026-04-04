import Image from "next/image";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import PostList from "@/components/PostList";
import ThemeToggle from "@/components/ThemeToggle";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function FeedPage() {
    const session = await getSessionUser();
    if (!session) {
        redirect("/login");
    }

    const currentUser = await prisma.user.findUnique({
        where: { id: session.userId },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
        },
    });

    if (!currentUser) {
        redirect("/login");
    }

    return (
        <div className="_layout _layout_main_wrapper">
            <ThemeToggle />
            <div className="_main_layout">
                <Navbar currentUser={currentUser} />

                <div className="_layout_inner_wrap">
                    <div className="container _custom_container">
                        <div className="row">
                            <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                                <div className="_layout_left_sidebar_wrap">
                                    <div className="_layout_left_sidebar_inner">
                                        <div className="_left_inner_area_explore _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                                            <h4 className="_left_inner_area_explore_title _title5  _mar_b24">Explore</h4>
                                            <ul className="_left_inner_area_explore_list">
                                                <li className="_left_inner_area_explore_item _explore_item">
                                                    <a href="#0" className="_left_inner_area_explore_link">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" stroke="#666" /></svg>
                                                        Learning
                                                    </a>
                                                    <span className="_left_inner_area_explore_link_txt">New</span>
                                                </li>
                                                <li className="_left_inner_area_explore_item"><a href="#0" className="_left_inner_area_explore_link"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20"><rect x="3" y="3" width="14" height="14" stroke="#666" /></svg>Insights</a></li>
                                                <li className="_left_inner_area_explore_item"><a href="#0" className="_left_inner_area_explore_link"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M10 3v14M3 10h14" stroke="#666" /></svg>Find friends</a></li>
                                                <li className="_left_inner_area_explore_item"><a href="#0" className="_left_inner_area_explore_link"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M4 4h12v12H4z" stroke="#666" /></svg>Bookmarks</a></li>
                                                <li className="_left_inner_area_explore_item"><a href="#0" className="_left_inner_area_explore_link"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M5 15v-1a3 3 0 013-3h4a3 3 0 013 3v1" stroke="#666" /><circle cx="10" cy="7" r="3" stroke="#666" /></svg>Group</a></li>
                                                <li className="_left_inner_area_explore_item _explore_item"><a href="#0" className="_left_inner_area_explore_link"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M3 10h14M10 3v14" stroke="#666" /></svg>Gaming</a> <span className="_left_inner_area_explore_link_txt">New</span></li>
                                                <li className="_left_inner_area_explore_item"><a href="#0" className="_left_inner_area_explore_link"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="3" stroke="#666" /><circle cx="10" cy="10" r="8" stroke="#666" /></svg>Settings</a></li>
                                                <li className="_left_inner_area_explore_item"><a href="#0" className="_left_inner_area_explore_link"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M4 4h12v12H4z" stroke="#666" /></svg>Save post</a></li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="_layout_left_sidebar_inner">
                                        <div className="_left_inner_area_suggest _padd_t24  _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                                            <div className="_left_inner_area_suggest_content _mar_b24">
                                                <h4 className="_left_inner_area_suggest_content_title _title5">Suggested People</h4>
                                                <span className="_left_inner_area_suggest_content_txt">
                                                    <a className="_left_inner_area_suggest_content_txt_link" href="#0">See All</a>
                                                </span>
                                            </div>
                                            <div className="_left_inner_area_suggest_info">
                                                <div className="_left_inner_area_suggest_info_box">
                                                    <div className="_left_inner_area_suggest_info_image">
                                                        <Image src="/assets/images/people1.png" alt="Image" width={40} height={40} className="_info_img" />
                                                    </div>
                                                    <div className="_left_inner_area_suggest_info_txt">
                                                        <h4 className="_left_inner_area_suggest_info_title">Steve Jobs</h4>
                                                        <p className="_left_inner_area_suggest_info_para">CEO of Apple</p>
                                                    </div>
                                                </div>
                                                <div className="_left_inner_area_suggest_info_link"><a href="#0" className="_info_link">Connect</a>
                                                </div>
                                            </div>
                                            <div className="_left_inner_area_suggest_info">
                                                <div className="_left_inner_area_suggest_info_box">
                                                    <div className="_left_inner_area_suggest_info_image">
                                                        <Image src="/assets/images/people2.png" alt="Image" width={40} height={40} className="_info_img1" />
                                                    </div>
                                                    <div className="_left_inner_area_suggest_info_txt">
                                                        <h4 className="_left_inner_area_suggest_info_title">Ryan Roslansky</h4>
                                                        <p className="_left_inner_area_suggest_info_para">CEO of Linkedin</p>
                                                    </div>
                                                </div>
                                                <div className="_left_inner_area_suggest_info_link"><a href="#0" className="_info_link">Connect</a>
                                                </div>
                                            </div>
                                            <div className="_left_inner_area_suggest_info">
                                                <div className="_left_inner_area_suggest_info_box">
                                                    <div className="_left_inner_area_suggest_info_image">
                                                        <Image src="/assets/images/people3.png" alt="Image" width={40} height={40} className="_info_img1" />
                                                    </div>
                                                    <div className="_left_inner_area_suggest_info_txt">
                                                        <h4 className="_left_inner_area_suggest_info_title">Dylan Field</h4>
                                                        <p className="_left_inner_area_suggest_info_para">CEO of Figma</p>
                                                    </div>
                                                </div>
                                                <div className="_left_inner_area_suggest_info_link"><a href="#0" className="_info_link">Connect</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="_layout_left_sidebar_inner">
                                        <div className="_left_inner_area_event _padd_t24  _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                                            <div className="_left_inner_event_content">
                                                <h4 className="_left_inner_event_title _title5">Events</h4>
                                                <a href="#0" className="_left_inner_event_link">See all</a>
                                            </div>

                                            <div className="_left_inner_event_card_link">
                                                <div className="_left_inner_event_card">
                                                    <div className="_left_inner_event_card_iamge">
                                                        <Image src="/assets/images/feed_event1.png" alt="Image" width={248} height={118} className="_card_img" />
                                                    </div>
                                                    <div className="_left_inner_event_card_content">
                                                        <div className="_left_inner_card_date">
                                                            <p className="_left_inner_card_date_para">10</p>
                                                            <p className="_left_inner_card_date_para1">Jul</p>
                                                        </div>
                                                        <div className="_left_inner_card_txt">
                                                            <h4 className="_left_inner_event_card_title">No more terrorism no more cry</h4>
                                                        </div>
                                                    </div>
                                                    <hr className="_underline" />
                                                    <div className="_left_inner_event_bottom">
                                                        <p className="_left_iner_event_bottom">17 People Going</p>
                                                        <button type="button" className="_left_iner_event_bottom_link">Going</button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="_left_inner_event_card_link">
                                                <div className="_left_inner_event_card">
                                                    <div className="_left_inner_event_card_iamge">
                                                        <Image src="/assets/images/feed_event1.png" alt="Image" width={248} height={118} className="_card_img" />
                                                    </div>
                                                    <div className="_left_inner_event_card_content">
                                                        <div className="_left_inner_card_date">
                                                            <p className="_left_inner_card_date_para">10</p>
                                                            <p className="_left_inner_card_date_para1">Jul</p>
                                                        </div>
                                                        <div className="_left_inner_card_txt">
                                                            <h4 className="_left_inner_event_card_title">No more terrorism no more cry</h4>
                                                        </div>
                                                    </div>
                                                    <hr className="_underline" />
                                                    <div className="_left_inner_event_bottom">
                                                        <p className="_left_iner_event_bottom">17 People Going</p>
                                                        <button type="button" className="_left_iner_event_bottom_link">Going</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12">
                                <div className="_layout_middle_wrap">
                                    <div className="_layout_middle_inner">
                                        <PostList
                                            currentUser={{
                                                id: currentUser.id,
                                                firstName: currentUser.firstName,
                                                lastName: currentUser.lastName,
                                                avatar: currentUser.avatar,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="col-xl-3 col-lg-3 col-md-12 col-sm-12">
                                <div className="_layout_right_sidebar_wrap">
                                    <div className="_layout_right_sidebar_inner">
                                        <div className="_right_inner_area_info _padd_t24 _padd_b24 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                                            <div className="_right_inner_area_info_content _mar_b24">
                                                <h4 className="_right_inner_area_info_content_title _title5">You Might Like</h4>
                                            </div>
                                            <div className="_right_inner_area_info_ppl">
                                                <div className="_right_inner_area_info_box">
                                                    <div className="_right_inner_area_info_box_image">
                                                        <Image src="/assets/images/Avatar.png" alt="Avatar" width={40} height={40} className="_ppl_img" />
                                                    </div>
                                                    <div className="_right_inner_area_info_box_txt">
                                                        <h4 className="_right_inner_area_info_box_title">Ryan Roslansky</h4>
                                                        <p className="_right_inner_area_info_box_para">CEO of LinkedIn</p>
                                                    </div>
                                                </div>
                                                <div className="_right_info_btn_grp">
                                                    <button type="button" className="_right_info_btn_link">Ignore</button>
                                                    <button type="button" className="_right_info_btn_link _right_info_btn_link_active">Follow</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="_layout_right_sidebar_inner">
                                        <div className="_feed_right_inner_area_card _padd_t24 _padd_b6 _padd_r24 _padd_l24 _b_radious6 _feed_inner_area">
                                            <div className="_feed_right_inner_area_card_content _mar_b24">
                                                <h4 className="_feed_right_inner_area_card_content_title _title5">Your Friends</h4>
                                            </div>
                                            <div className="_feed_right_inner_area_card_ppl">
                                                <div className="_feed_right_inner_area_card_ppl_box">
                                                    <div className="_feed_right_inner_area_card_ppl_image">
                                                        <Image src="/assets/images/people1.png" alt="People" width={40} height={40} className="_box_ppl_img" />
                                                    </div>
                                                    <div className="_feed_right_inner_area_card_ppl_txt">
                                                        <h4 className="_feed_right_inner_area_card_ppl_title">Steve Jobs</h4>
                                                        <p className="_feed_right_inner_area_card_ppl_para">CEO of Apple</p>
                                                    </div>
                                                </div>
                                                <div className="_feed_right_inner_area_card_ppl_side">
                                                    <span>Online</span>
                                                </div>
                                            </div>
                                            <div className="_feed_right_inner_area_card_ppl">
                                                <div className="_feed_right_inner_area_card_ppl_box">
                                                    <div className="_feed_right_inner_area_card_ppl_image">
                                                        <Image src="/assets/images/people2.png" alt="People" width={40} height={40} className="_box_ppl_img" />
                                                    </div>
                                                    <div className="_feed_right_inner_area_card_ppl_txt">
                                                        <h4 className="_feed_right_inner_area_card_ppl_title">Dylan Field</h4>
                                                        <p className="_feed_right_inner_area_card_ppl_para">CEO of Figma</p>
                                                    </div>
                                                </div>
                                                <div className="_feed_right_inner_area_card_ppl_side">
                                                    <span>5 min ago</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
