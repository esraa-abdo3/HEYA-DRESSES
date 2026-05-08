

import Getproducts from "../componets/products/ProductsClient";


async function getProducts() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const res = await fetch(`${baseUrl}/api/Products`, {
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