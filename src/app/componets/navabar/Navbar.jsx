"use client"
import Link from "next/link";
import { FaHeart, FaShoppingCart, FaUser } from "react-icons/fa";
import { useState } from "react";
import "./Navbar.css"
import { useSession, signIn, signOut } from "next-auth/react";

export default function Navbar() {

    const [open, setOpen] = useState(false);
    const { data: session } = useSession();
    console.log(session)

    return (
        <>
            <div className="Navbar">
                <div className="container">

                    <div className="menuIcon" onClick={() => setOpen(true)}>
                        ☰
                    </div>

                    <ul className="links">
                        <li><Link href={"/"} >Home</Link></li>
                        <li><Link href="/about">About</Link></li>
                        <li><Link href="/contact">Contact Us</Link></li>
                        <li><Link href="/products">Products</Link></li>
                    </ul>

                    <div className="logoname">
                        HEYA
                    </div>


                    <div className="icons">
                        <Link href="/wishlist" className="wishlist"><FaHeart /></Link>
                        <Link href="/cart"><FaShoppingCart /></Link>
                        {/* {session ? <Link href={logout}> log out</Link> :
                                <Link href="/login">Sign up</Link>
                        } */}
                    
                    </div>

                </div>
            </div>

            {/* Sidebar */}
            <div className={`sidebar ${open ? "active" : ""}`}>
                
                <span className="close" onClick={() => setOpen(false)}>✖</span>

                <div className="logoname">Skincare</div>

                <ul className="sidebar-links">
                    <li><Link href="/" onClick={() => setOpen(false)}>Home</Link></li>
                    <li><Link href="/about" onClick={() => setOpen(false)}>About</Link></li>
                    <li><Link href="/contact" onClick={() => setOpen(false)}>Contact Us</Link></li>
                    <li><Link href="/products" onClick={() => setOpen(false)}>Products</Link></li>
                </ul>

         

            </div>

            {/* Overlay */}
            {open && <div className="overlay" onClick={() => setOpen(false)}></div>}
        </>
    );
}