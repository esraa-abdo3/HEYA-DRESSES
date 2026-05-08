
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
import Navbar from "./componets/navabar/Navbar";
import AuthProvider from "./providers/AuthProvider";
import { CartProvider } from "./Context/cartcontext";
import { getInitialCart } from "./Context/cardserver";
import { WishlistProvider } from "./Context/WishlistContext";
import { getInitialwishlist } from "./Context/Wishlistserver";
import Header from "./componets/Header/Header";
import Footer from "./componets/Footer/Footer";
import { getAllpromocodes } from "./Context/Promocodeserver";
import GuestInit from "./prodivders/gestprovider";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

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
        <AuthProvider>
          <GuestInit isGuest={isGuest} />

          <WishlistProvider initiallist={cleanWish}>
            <CartProvider initialCart={cleanCart} promocodes={cleanpromocodes}>
              <Header />
              <Navbar />

              {children}

              <Footer />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}