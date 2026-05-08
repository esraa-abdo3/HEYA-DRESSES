
// "use client";

// import { createContext, useContext, useEffect, useState } from "react";
// import axios from "axios";

// const CartContext = createContext();

// export const CartProvider = ({ children, initialCart }) => {

//   const [cart, setCart] = useState(initialCart);
//   console.log("carts is", cart)



//   const addToCart = async (product) => {
//   console.log("sending productId:", product._id);
//   const prev = cart;

//   setCart((old) => {
//     const exists = old.find(
//       (item) => item.productId._id === product._id
//     );

//     if (exists) {
//       return old.map((item) =>
//         item.productId._id === product._id
//           ? { ...item, quantity: item.quantity + 1 }
//           : item
//       );
//     }

//     return [  ...old,   {
//     productId: product,
//     quantity: 1,
//   },];
//   });

//   try {
//     await axios.post("/api/Cart", {
//       productId: product._id,
//     });
//   } catch (e) {
//     console.log(e)
//     setCart(prev);
//   }
// };
//   const removeFromCart = async (productId) => {
//     const prev = cart;

//     setCart((old) =>
//       old.filter((item) => item.productId._id !== productId)
//     );

//     try {
//       await axios.delete("/api/Cart", {
//         data: { productId },
//       });
//       console.log("delete scuceesss")
//     } catch (e) {
//       console.log(e)
//       setCart(prev);
//     }
//   };


//   const updateQuantity = async (productId, action) => {
//     const prev = cart;

//     setCart((old) =>
//       old
//         .map((item) =>
//           item.productId._id === productId
//             ? {
//                 ...item,
//                 quantity:
//                   action === "inc"
//                     ? item.quantity + 1
//                     : item.quantity - 1,
//               }
//             : item
//         )
//         .filter((i) => i.quantity > 0)
//     );

//     try {
//       await axios.patch("/api/Cart", {
//         productId,
//         action,
//       });
//     } catch (e) {
//       setCart(prev);
//     }
//   };

//   return (
//     <CartContext.Provider
//       value={{
//         cart,
//         setCart,
//         addToCart,
//         removeFromCart,
//         updateQuantity,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };

// export const useCart = () => useContext(CartContext);
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

const CartContext = createContext();

export const CartProvider = ({ children, initialCart, promocodes }) => {
  const { data: session } = useSession();
    
  const [allpromocodes,setpromocodes]=useState(promocodes)
  const [cart, setCart] = useState(initialCart);
  const [cartError, setCartError] = useState({});
  useEffect(() => {
  const guestId = localStorage.getItem("guestId");

  if (!session?.user && guestId) {
    axios.get(`/api/Cart?guestId=${guestId}`)
      .then(res => setCart(res.data.cart.items));
  }
}, []);

  const addToCart = async (product) => {
    setCartError("");

    const currentItem = cart.find(
      (item) => item.productId._id === product._id
    );

    const currentQuantity = currentItem ? currentItem.quantity : 0;

    // check stock
    if (currentQuantity >= product.stock) {
      setCartError({ [product._id]: `Only ${product.stock} items available` });
      return;
    }

    const prev = cart;

    setCart((old) => {
      const exists = old.find(
        (item) => item.productId._id === product._id
      );

      if (exists) {
        return old.map((item) =>
          item.productId._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...old,
        {
          productId: product,
          quantity: 1,
        },
      ];
    });
    const payload = {
  productId: product._id,
};

const guestId = localStorage.getItem("guestId");

if (guestId) {
  payload.guestId = guestId;
}

    try {
      await axios.post("/api/Cart", payload);
    } catch (e) {
      console.log(e);
      setCart(prev);
    }
  };
   const removeFromCart = async (productId) => {
    const prev = cart;

    setCart((old) =>
      old.filter((item) => item.productId._id !== productId)
    );
    const payload = {
  productId
};

const guestId = localStorage.getItem("guestId");

if (guestId) {
  payload.guestId = guestId;
}

    try {
     await axios.delete("/api/Cart", {
  data: payload,
});
      console.log("delete scuceesss")
    } catch (e) {
      console.log(e)
      setCart(prev);
    }
  };
const updateQuantity = async (productId, action) => {
    const prev = cart;

    setCart((old) =>
      old
        .map((item) =>
          item.productId._id === productId
            ? {
                ...item,
                quantity:
                  action === "inc"
                    ? item.quantity + 1
                    : item.quantity - 1,
              }
            : item
        )
        .filter((i) => i.quantity > 0)
  );
      const payload = {
        productId,
        action
};

const guestId = localStorage.getItem("guestId");

if (guestId) {
  payload.guestId = guestId;
}

    try {
      await axios.patch("/api/Cart",payload);
    } catch (e) {
      setCart(prev);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        cartError,
        allpromocodes,
        setCart,
        removeFromCart,
        updateQuantity
       
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);