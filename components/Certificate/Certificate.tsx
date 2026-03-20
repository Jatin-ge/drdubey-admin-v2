import Image from "next/image";
import React from "react";

type Props = {};

const Certificate = (props: Props) => {
  return (
    <div className="flex flex-col items-center justify-center mb-8 xl:space-x-5">
      <h1 className=" text-center my-8 w-[80%] font-extrabold text-gray-700 text-xl lg:text-3xl xl:text-6xl leading-relaxed ">
        <span className="text-primary">Dr. Dheeraj</span> got awarded for{" "}
        <span className="text-primary">Most Trusted </span>Joint Replacement
        Surgeon of the Year
      </h1>
      <Image
        width={900}
        height={900}
        src="/assets/images/certi2.jpeg"
        alt="certi"
      />
    </div>
  );
};

export default Certificate;
