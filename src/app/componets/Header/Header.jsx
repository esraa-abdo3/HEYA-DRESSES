// import React from "react";
// import { FaFacebookF } from "react-icons/fa";
// import { SlSocialInstagram } from "react-icons/sl";
// import { FaWhatsapp } from "react-icons/fa";
// import { TfiEmail } from "react-icons/tfi";
// import "./Header.css";

// export default function Header() {
//   const messages = [
//     `Every piece is carefully selected just for you`,
//    `
//       Follow us on Instagram
//       <a
//         href="https://www.instagram.com/dressesheya/"
//         target="_blank"
//         rel="noopener noreferrer"
//       >
//         heya.dresses
//       </a>
//    `,
//     `Shine in the latest collection of evening dresses`
//     ,
//   ];

 
//   const tickerItems = [...messages, ...messages];

//   return (
//     <>
//       <header>
//         {/* Ticker Announcement Bar */}
//         <div className="announcement-bar">
//           <div className="ticker-track">
//             <div className="ticker-items">
//               {tickerItems.map((msg, idx) => (
//                 <React.Fragment key={idx}>
//                   <span className="ticker-text">{msg}</span>
//                   <span className="ticker-bullet">💗</span>
//                 </React.Fragment>
//               ))}
//             </div>
//             <div className="ticker-items" aria-hidden="true">
//               {tickerItems.map((msg, idx) => (
//                 <React.Fragment key={`dup-${idx}`}>
//                   <span className="ticker-text">{msg}</span>
//                   <span className="ticker-bullet">💗</span>
//                 </React.Fragment>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Original social links and contact bar
//         <div className="container header-main-container">
//           <div className="emailus">
//             <a href="mailto:esraaabdalnasserzz@gmail.com">
//               <TfiEmail /> Email us
//             </a>
//           </div>
//           <div className="sociallinks">
//             <a href="https://www.facebook.com/ayat.abdelnasser.9?locale=ar_AR">
//               <FaFacebookF />
//             </a>
//             <a href="">
//               <SlSocialInstagram />
//             </a>
//             <a href="">
//               <FaWhatsapp />
//             </a>
//           </div>
//         </div> */}
//       </header>
//     </>
//   );
// }
"use client";

import React from "react";
import { FaFacebookF } from "react-icons/fa";
import { SlSocialInstagram } from "react-icons/sl";
import { FaWhatsapp } from "react-icons/fa";
import { TfiEmail } from "react-icons/tfi";
import "./Header.css";

export default function Header() {
  const messages = [
    <>Every piece is carefully selected just for you</>,
    <>
      Follow us on Instagram{" "}
      <a href="https://www.instagram.com/dressesheya/" target="_blank" rel="noopener noreferrer">
        heya.dresses
      </a>
    </>,
    <>Shine in the latest collection of evening dresses</>,
  ];

  const tickerItems = [...messages, ...messages];

  return (
    <header>
      <div className="announcement-bar">
        <div className="ticker-track">
          <div className="ticker-items">
            {tickerItems.map((msg, idx) => (
              <React.Fragment key={idx}>
                <span className="ticker-text">{msg}</span>
                <span className="ticker-bullet">💗</span>
              </React.Fragment>
            ))}
          </div>
          <div className="ticker-items" aria-hidden="true">
            {tickerItems.map((msg, idx) => (
              <React.Fragment key={`dup-${idx}`}>
                <span className="ticker-text">{msg}</span>
                <span className="ticker-bullet">💗</span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}