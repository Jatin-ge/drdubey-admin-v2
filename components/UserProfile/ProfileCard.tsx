import { db } from "@/lib/db";
import Image from "next/image";
import React from "react";

interface Props {
  name: string;
  imageUrl: string;
  email: string;
  appointments: any;
  phone: string;
}

const ProfileCard = ({ name, imageUrl, email, appointments, phone }: Props) => {
  return (
    <>
      <div className="flex flex-col md:flex-row ">
        <div className="bg-white md:w-[50%] overflow-hidden shadow rounded-lg border mx-auto">
          <div className="px-4 flex justify-between py-5 sm:px-6 bg-primary text-white">
            <h3 className="text-lg leading-6 font-medium">{name}</h3>

            <Image
              src={imageUrl}
              width={56}
              height={56}
              className="rounded-full"
              alt="Profile Picture"
            />
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Patient name
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {name}
                </dd>
              </div>
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Email address
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {email}
                </dd>
              </div>
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Phone Number
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {phone}
                </dd>
              </div>
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Age</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {appointments[0]?.age}
                </dd>
              </div>
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Gender</dt>
                {appointments[0] ? (
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {appointments[0]?.gender === "M" ? "Male" : "Female"}
                  </dd>
                ) : (
                  <div></div>
                )}
              </div>
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {appointments[0]?.address}
                </dd>
              </div>
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">City</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {appointments[0]?.cityname}
                </dd>
              </div>
              <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  Description
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {appointments.length > 1
                    ? appointments[0]?.description
                    : "First Appointment"}
                </dd>
              </div>
              {/* Add other profile information sections as needed */}
            </dl>
          </div>
        </div>
        <div className="w-full md:w-[30%] mx-auto bg-gradient-to-r from-blue-400 to-teal-500 shadow-md rounded-md p-8 text-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-6">
              Your Appointments
            </h2>
            {appointments.length === 0 ? (
              <p className="text-lg text-center">No appointments booked yet.</p>
            ) : (
              <ul className="divide-y divide-white">
                <li className="py-4 transition duration-300 transform hover:scale-105">
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold leading-relaxed">Date</p>
                    <p className="text-2xl font-bold leading-relaxed">Time</p>
                    <p className="text-2xl font-bold leading-relaxed">City</p>
                  </div>
                </li>
                {appointments.map((appointment: any) => (
                  <li
                    key={appointment.id}
                    className="py-4 transition duration-300 transform hover:scale-105"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold">{appointment.date}</p>
                      <p className="text-2xl font-bold">{appointment.time}</p>
                      <p className="text-2xl font-bold">{appointment.cityname}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileCard;
