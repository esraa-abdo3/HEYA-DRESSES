import Historyorder from "../../componets/myorders/Historyorder";
import { getMyOrders }  from "../../Context/Ordersever";

export default async function Myorder() {

    const orders = await getMyOrders() || [];
    console.log(orders)
  
    return (
        <div>
<Historyorder orders={orders}/>
        </div>
    )
    
}