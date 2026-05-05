import Link from "next/link";
import "./Footer.css";
import { FaInstagram, FaFacebookF, FaWhatsapp } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";

export default function Footer() {
    return (
        <footer className="footer">

            {/* Newsletter Strip */}
            <div className="footer-newsletter">
                <p className="newsletter-label">JOIN THE HEYA CIRCLE</p>
                <div className="newsletter-form">
                    <input type="email" placeholder="Your email address" />
                    <button>SUBSCRIBE</button>
                </div>
            </div>

            {/* Main Footer */}
            <div className="footer-main">

                {/* Brand */}
                <div className="footer-brand">
                    <h2 className="footer-logo">HEYA</h2>
                    <p className="footer-tagline">
                        Timeless designs for every<br />special moment.
                    </p>
                    <div className="footer-socials">
                        <a href="#" aria-label="Instagram"><FaInstagram /></a>
                        <a href="#" aria-label="Facebook"><FaFacebookF /></a>
                        <a href="#" aria-label="WhatsApp"><FaWhatsapp /></a>
                        <a href="mailto:hello@heya.com" aria-label="Email"><MdOutlineEmail /></a>
                    </div>
                </div>

                {/* Shop */}
                <div className="footer-col">
                    <h4>SHOP</h4>
                    <ul>
                        <li><Link href="#new-arrivals">New Arrivals</Link></li>
                        <li><Link href="#best-sellers">Best Sellers</Link></li>
                        <li><Link href="/products">All Collections</Link></li>
                        <li><Link href="/Wishlist">Wishlist</Link></li>
                    </ul>
                </div>

                {/* Help */}
                <div className="footer-col">
                    <h4>HELP</h4>
                    <ul>
                        <li><Link href="/my-orders">My Orders</Link></li>
                        <li><Link href="#">Shipping & Returns</Link></li>
                        <li><Link href="#">Size Guide</Link></li>
                        <li><Link href="/contact">Contact Us</Link></li>
                    </ul>
                </div>

                {/* Contact */}
                <div className="footer-col">
                    <h4>CONTACT</h4>
                    <ul className="footer-contact">
                        <li>hello@heya.com</li>
                        <li>+20 100 000 0000</li>
                        <li>Port Said, Egypt</li>
                        <li>Sat – Thu: 10am – 9pm</li>
                    </ul>
                </div>

            </div>

            {/* Bottom Bar */}
            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} HEYA. All rights reserved.</p>
                <div className="footer-bottom-links">
                    <Link href="#">Privacy Policy</Link>
                    <span>·</span>
                    <Link href="#">Terms of Use</Link>
                </div>
            </div>

        </footer>
    );
}