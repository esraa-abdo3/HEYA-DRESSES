

import Getproducts from "../componets/products/ProductsClient";


async function getProducts() {
  const res = await fetch("https://heya-dresses-b9u3.vercel.app/api/Products", {
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