import Footer from "@/components/Footer/Footer";
import Navbar from "@/components/Navbar/navbar";
import { db } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const page = async ({ params }: { params: { id: string } }) => {
  console.log("the id is ", params.id);

  const data = await db.services.findUnique({
    where: {
      id: params.id,
    },
  });

  const allBlogs = await db.services.findMany();

  console.log("the service is ", data);

  return (
    <>
      <Navbar />
      <div className="container mx-auto">
        <main className="mt-12">
          <div className="flex flex-col md:flex-row space-x-0 md:space-x-6 mb-16 ">
            <div className="left mb-4 lg:mb-0 p-4 lg:p-0 w-full md:w-4/7 relative rounded block">
              <Image
                src={data?.image || "/assets/images/col2.jpg"}
                height={900}
                width={900}
                alt="img"
                className="rounded-md object-cover w-[700px] h-[670px]"
              />
              <span className="text-green-700 text-sm hidden md:block mt-4">
                Dr. Dheeraj Dubay
              </span>
              <h1 className="text-gray-800 text-4xl font-bold mt-2 mb-2 leading-tight">
                {data?.title}
              </h1>
              <p className="text-xl">{data?.blog}</p>
            </div>

            <div className="right w-full md:w-2/3 ">
              <div className="md:sticky md:top-8  ">
                <div className=" text-[#EE8A27] font-semibold m-2 text-xl">
                  recent post
                </div>

                <div className="rounded w-full flex flex-col  mb-10">
                  {allBlogs?.map((item: any) => (
                    // eslint-disable-next-line react/jsx-key
                    <Link href={`/services/${item.id}`}>
                      <div
                        key={item.id}
                        className="rounded w-full flex flex-col md:flex-row mb-10"
                      >
                        <Image
                          height={250}
                          width={200}
                          src={item.image || "/assets/images/contact.jpg"}
                          alt="img"
                          className="block md:hidden lg:block rounded-md h-64 md:h-32 m-4 md:m-0"
                        />
                        <div className="bg-white rounded px-4">
                          <div className="md:mt-0  text-gray-800 font-semibold text-xl mb-2">
                            {item.title}
                          </div>
                          <p className=" p-2 pl-0 pt-1 text-sm text-gray-600">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default page;
