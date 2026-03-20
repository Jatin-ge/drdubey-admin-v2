import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { useReactTable } from "@tanstack/react-table";
import { redirect, useRouter } from "next/navigation";
import Link from "next/link";

const BookingSuccess = async () => {
  const profile = await currentProfile();
  if (!profile) {
    return redirect("/sign-in");
  }

  const bookings = await db.profile.findUnique({
    where: {
      userId: profile.userId,
    },

    include: {
      appointments: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
  if (!bookings) {
    return redirect("/booking");
  }

  console.log(bookings);

  return (
    <div>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-500">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full md:w-2/3 lg:w-1/2 xl:w-1/3">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-800">
            Booking Successful!
          </h2>
          <p className="text-center text-lg text-gray-700 mb-6">
            Thank you for booking with us. Your appointment has been confirmed.
          </p>
          <div className="flex justify-between">
            <Link href="/">
              <button className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded">
                Back to Home
              </button>
            </Link>
            <Link href="/profile">
              <button className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded">
                My appointments
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
