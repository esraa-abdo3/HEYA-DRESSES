// app/Context/SelectedProductContext.jsx
"use client";

import { createContext, useContext, useState } from "react";

const SelectedProductContext = createContext();

export function SelectedProductProvider({ children }) {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <SelectedProductContext.Provider value={{ selectedProduct, setSelectedProduct }}>
      {children}
    </SelectedProductContext.Provider>
  );
}

export function useSelectedProduct() {
  return useContext(SelectedProductContext);
}