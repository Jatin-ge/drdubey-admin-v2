
import ProfileCard from "@/components/UserProfile/ProfileCard";
import { db } from "@/lib/db";
import React from "react";

import { currentProfile } from "@/lib/current-profile";
import Navbar from "@/components/Navbar/navbar";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";
import ProfilePage from "../components/profile-page";

interface profileProps {
    params:{
        userId: string;
    }
}

const Page = async ({params}: profileProps) => {


  const profile = await db.profile.findUnique({
    where: {
      userId: params.userId,
    },
    include:{
      appointments:true
    }
  });
  if(!profile){
    return null;
  }
  return (
    <div>
      <ProfilePage profile={profile} />
    </div>
  );
};

export default Page;
