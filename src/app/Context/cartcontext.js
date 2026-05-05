
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const CartContext = createContext();

export const CartProvider = ({ children, initialCart }) => {

  const [cart, setCart] = useState(initialCart);
  console.log("carts is", cart)



  const addToCart = async (product) => {
  console.log("sending productId:", product._id);
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

    return [  ...old,   {
    productId: product, 
    quantity: 1,
  },];
  });

  try {
    await axios.post("/api/Cart", {
      productId: product._id,
    });
  } catch (e) {
    console.log(e)
    setCart(prev);
  }
};
  const removeFromCart = async (productId) => {
    const prev = cart;

    setCart((old) =>
      old.filter((item) => item.productId._id !== productId)
    );

    try {
      await axios.delete("/api/Cart", {
        data: { productId },
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

    try {
      await axios.patch("/api/Cart", {
        productId,
        action,
      });
    } catch (e) {
      setCart(prev);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        removeFromCart,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);