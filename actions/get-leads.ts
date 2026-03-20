import { db } from "@/lib/db";

export const getLastMonthLeads = async () => {
    const leads = await db.lead.count({
        where: {
            createdAt: {
                gte: new Date(new Date().setDate(new Date().getDate()-30))
            }
        }
    });

    return leads;
}