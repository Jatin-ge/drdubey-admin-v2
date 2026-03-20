"use client";
import ProfileCard from "@/components/UserProfile/ProfileCard";
import { db } from "@/lib/db";
import React from "react";

import { currentProfile } from "@/lib/current-profile";
import Navbar from "@/components/Navbar/navbar";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal-store";

interface profileProps {
  profile: any;
}

const ProfilePage = ({ profile }: profileProps) => {
  const { onOpen } = useModal();

  return (
    <>
      <ProfileCard
        name={profile.name}
        imageUrl={profile?.imageUrl}
        email={profile?.email}
        appointments={profile.appointments}
        phone={profile.appointments[0].phone}
      />
      <div className="container mx-auto px-4 mt-10 mb-10 ">
        <h2 className="text-3xl font-bold mb-2">Discussions</h2>
        <div className="flex flex-col gap-6 ">
          {profile.appointments.map((appointment: any) => (
            <div
              key={appointment.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4"
            >
              {appointment.discussionTitle ? (
                <div className="flex justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      {appointment.discussionTitle}
                    </h3>
                    <p className="text-gray-600">
                      {appointment.discussionDescription}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-200">
                      {appointment.date} at {appointment.time}
                    </p>
                    <Button
                      onClick={() => {
                        onOpen("editDiscussion", { appointment: appointment });
                      }}
                    >
                      Edit Discussion
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between">
                  <h3 className="text-xl font-bold mb-2 text-center">
                    No discussion for appointment scheduled for{" "}
                    {appointment.date} at {appointment.time}
                  </h3>
                  <div>
                    <p className="text-gray-600 dark:text-gray-200">
                      {appointment.date} at {appointment.time}
                    </p>
                    <Button
                      className="flex justify-between"
                      onClick={() =>
                        onOpen("createDiscussion", { appointment: appointment })
                      }
                    >
                      Create Discussion
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
