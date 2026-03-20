import { db } from "@/lib/db";

export const revenue = async () => { 
    const sales = await db.lead.findMany({
        
    });
    var total = 0;
    sales.map((sale) => {
        if(sale.bill === null)
        {
            total += 0;
        }
        else{
            total += sale.bill;
        }
    })
    return total;
}