

import Getproducts from "../componets/products/ProductsClient";


async function getProducts() {
  const res = await fetch("http://localhost:3000/api/Products", {
    cache: "no-store",
  });

  const data = await res.json();
  return data.data;
}

export default async function Page() {
  const products = (await getProducts()) || [];




  return (
    <>
     
       < Getproducts products = { products } />;
    </>
  )
   
}