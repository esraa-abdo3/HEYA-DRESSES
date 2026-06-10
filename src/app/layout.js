
// import "./globals.css";
// import Navbar from "./componets/navabar/Navbar";
// import AuthProvider from "./providers/AuthProvider";
// import { CartProvider } from "./Context/cartcontext";
// import { getInitialCart } from "./Context/cardserver";
// import { WishlistProvider } from "./Context/WishlistContext";
// import { getInitialwishlist } from "./Context/Wishlistserver";
// import Header from "./componets/Header/Header";
// import Footer from "./componets/Footer/Footer";
// import { getAllpromocodes } from "./Context/Promocodeserver";
// import GuestInit from "./prodivders/gestprovider";
// import { getServerSession } from "next-auth";
// import { authOptions } from "./api/auth/[...nextauth]/route";



// export default async function RootLayout({ children }) {
//   const cart = await getInitialCart()
//   const wish = await getInitialwishlist();
//   const promocodes = await getAllpromocodes();
//   const cleanCart = JSON.parse(JSON.stringify(cart));
//   const cleanWish = JSON.parse(JSON.stringify(wish));
//   const session = await getServerSession(authOptions);

//   const isGuest = !session?.user;

  

//   return (
//     <>
//           <html lang="en">
//       <body>
//           <AuthProvider >
//             <GuestInit isGuest={isGuest} >
              
   
//           <WishlistProvider initiallist={cleanWish}>
//             <CartProvider initialCart={cleanCart} promocodes={promocodes} >
//               <Header/>
//               <Navbar />
           
//             {children}
//             </CartProvider>
//               </WishlistProvider>
//                    </GuestInit>
//         </AuthProvider>
//       </body>
 
//     </html>
//          <Footer/>
//     </>

//   );
// }
export const dynamic = "force-dynamic";
import "./globals.css";

import AuthProvider from "./providers/AuthProvider";
import { CartProvider } from "./Context/cartcontext";
import { getInitialCart } from "./Context/cardserver";
import { WishlistProvider } from "./Context/WishlistContext";
import { getInitialwishlist } from "./Context/Wishlistserver";

import { getAllpromocodes } from "./Context/Promocodeserver";
import GuestInit from "./prodivders/gestprovider";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import Script from "next/script";

export default async function RootLayout({ children }) {
  const cart = await getInitialCart();
  const wish = await getInitialwishlist();
  const promocodes = await getAllpromocodes();
const cleanpromocodes= JSON.parse(JSON.stringify(promocodes));
  const cleanCart = JSON.parse(JSON.stringify(cart));
  const cleanWish = JSON.parse(JSON.stringify(wish));

  const session = await getServerSession(authOptions);
  const isGuest = !session?.user;

  return (
    <html lang="en">
      <body>
      
              <Script
        id="meta-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
          `,
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
        <AuthProvider>
          <GuestInit isGuest={isGuest} />

          <WishlistProvider initiallist={cleanWish}>
            <CartProvider initialCart={cleanCart} promocodes={cleanpromocodes}>
        

              {children}

         
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}