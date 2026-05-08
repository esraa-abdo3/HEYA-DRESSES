"use client"
import Link from "next/link";
import {  FaShoppingCart, FaUser } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import "./Navbar.css"
import { useSession, signIn, signOut } from "next-auth/react";
import { useCart } from "@/app/Context/cartcontext";
import { FaRegHeart } from "react-icons/fa";
import { useWishlist } from "@/app/Context/WishlistContext";
import { LuUserRound } from "react-icons/lu";
import { usePathname } from "next/navigation";



export default function Navbar() {

    const [open, setOpen] = useState(false);
    const { data: session } = useSession();
    console.log(session)
    const { cart } = useCart();
    const { wishlist } = useWishlist();
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    const [dropdownOpen, setDropdownOpen] = useState(false); 
    const dropdownRef = useRef(null);     
    const pathname=usePathname()
    
    useEffect(() => {
    
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            <div className="Navbar">
                <div className="container">

                    <div className="menuIcon" onClick={() => setOpen(true)}>
                        ☰
                    </div>

                    <ul className="links">
                        <li><Link href={"/"} className={pathname === "/" ? "active" : ""} >Home</Link></li>
                           <li><Link href={"/Myorders"} className={pathname === "/Myorders" ? "active" : ""} >my orders</Link></li>
                        {/* <li><Link href={"/"} >About us</Link></li> */}

                 
                    </ul>

                    <div className="logoname">
                        HEYA
                    </div>


                    <div className="icons">
                        <Link href="/Wishlist" className="wishlist"><FaRegHeart /> <p>{ wishlist.length}</p></Link>
                        <Link href="/Cart" className="carticon"><FaShoppingCart />  <p>{ cartCount}</p></Link>
                       
                        {session ? (
                            <div className="user-menu" ref={dropdownRef}>
                                <button
                                    className="user-icon-btn"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                >
                                    <LuUserRound />
                                </button>

                                <div className={`user-dropdown ${dropdownOpen ? "show" : ""}`}>
                                    <Link
                                        href="/Myorders"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                     My Orders
                                    </Link>
                                    <button onClick={() =>
                                    {
                                       
                                          signOut()
                                        }
                                      
                                    }>
                                         Log Out
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link href="/Auth/login" className="login">Sign up</Link>
                        )}
                    
                    </div>

                </div>
            </div>

            {/* Sidebar */}
            <div className={`sidebar ${open ? "active" : ""}`}>
                
                <span className="close" onClick={() => setOpen(false)}>✖</span>

                <div className="logoname">Skincare</div>
                <div style={{ display: "flex", justifyContent: "space-between"  , flexDirection:"column", height:"100%"}}>
                            <ul className="sidebar-links">
                    <li><Link href="/" onClick={() => setOpen(false)}>Home</Link></li>
                   
                    <li><Link href="/Myorders" onClick={() => setOpen(false)}>My orders</Link></li>
                     {/* <li><Link href="/about" onClick={() => setOpen(false)}>About</Link></li> */}
                </ul>
                <div>

            
                        {session ? (
                       
    
                            <button className="logout"
                                onClick={() => {
   signOut();
   setOpen(false);
}}
                            >
                                         Log Out
                                    </button>
                           
                        ) : (
                                <Link href="/Auth/login" className="login"
                                    onClick={() => {
                                        setOpen(false)
                                    }}
                                >Sign up</Link>
                    )}
                        </div>

                </div>

        

         

            </div>

            {/* Overlay */}
            {open && <div className="overlay" onClick={() => setOpen(false)}></div>}
        </>
    );
}