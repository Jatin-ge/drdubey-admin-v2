import { db } from "@/lib/db";

import Appointment from "@/components/ui/appointment-form";
import { currentProfile } from "@/lib/current-profile";
import { redirect, useParams, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation"
import PreviousAppointment from "@/components/ui/previous-appointment";

const BillboardPage = async () => {
  const profile = await currentProfile();

  if(!profile){
    return redirect("/sign-in");
  }

  const appointments = await db.appointment.findMany({
    where: {
      userId: profile.userId,
    },
    include:{
      user: true,
    }
  })

  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {
          appointments.length === 0 ? (
            <Appointment name={profile.name} email={profile.email} userId={profile.userId}/>
          ): (<PreviousAppointment appointments = {appointments}/>)
        }
        
        
      </div>
    </div>
  );
}

export default BillboardPage;