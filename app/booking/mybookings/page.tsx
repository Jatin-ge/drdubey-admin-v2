import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import React from 'react';

const AppointmentList = async() => {

    const profile = await currentProfile();
    if(!profile) {
        return redirect("/sign-in");
    }
    const appointments = await db.appointment.findMany({
        where:{
            userId: profile.userId,
            },
        orderBy:{
            createdAt: "desc"
        }
        })

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Your Appointments
        </h2>
        {appointments.length === 0 ? (
          <p className="text-lg text-gray-600 text-center">
            No appointments booked yet.
          </p>
        ) : (
          <ul className="divide-y divide-gray-300">
            {appointments.map((appointment) => (
              <li
                key={appointment.id}
                className="py-4 transition duration-300 transform hover:scale-105"
              >
                <div className="flex items-center justify-between ">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 ">
                      {appointment.name.toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {appointment.date} at {appointment.time}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AppointmentList;
