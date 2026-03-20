import { db } from "@/lib/db"

export const getAppoinments = async() => {
    const appoiments = await db.appointment.findMany({
        
    })

    return appoiments.length;
}