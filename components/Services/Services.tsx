import React from "react";

import PsychologyIcon from "@mui/icons-material/Psychology";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Link from "next/link";

type Props = {};

const Services = (props: Props) => {
  return (
    <div id="services" className="bg-[#F4FEFA] py-8 dark:bg-inherit ">
      <div className="container  mx-auto  h-full w-full">
        <div className="flex justify-between flex-col sm:flex-row   2xl:-ml-16">
          <div className=" w-[100%] sm:w-[40vw] ">
            <span className="text-primary  font-semibold text-xl">
              SERVICES & TREATMENT
            </span>
            <p className="bolder text-3xl sm:text-3xl lg:text-5xl font-semibold mt-2 mb-8 md:mb-16  dark:text-gray-200">
              More than 5 speciality and health care{" "}
              <span className="text-primary">services</span>
            </p>
          </div>
          <div className="">
            <button className="bg-primary  px-8 font-bold py-3 rounded-xl text-white md:mt-[35%]">
              See all Services
            </button>
          </div>
        </div>
        <div className=" sm:mx-5 flex flex-wrap justify-around dark:text-gray-700">
          <div
            data-aos="flip-down"
            className="flex w-[500px]  bg-white  py-10 px-8 rounded-xl relative my-4 md:mx-6 shadow-xl"
          >
            <div className="">
              <PsychologyIcon className="" />
            </div>
            <div className="flex-row mx-4 ">
              <Link href={"/services/6587bd817a2ebd09d835bd1a"}>
                <div>
                  <h1 className="bolder text-2xl font-semibold md:text-4xl">
                    Total Elbow Replacement
                  </h1>
                </div>
                <div className="flex mt-4 text-lg items-end">
                  <span>
                    Although elbow joint replacement is much less common than
                    knee or hip replacement, it is just as successful in
                    relieving joint pain and returning people to activities they
                    enjoy.
                  </span>
                  <div className="absolute bottom-0 right-0 bg-primary w-[60px] h-10 rounded-br-xl flex items-center justify-center ">
                    <ArrowForwardIcon />
                  </div>
                </div>
              </Link>
            </div>
          </div>
          <div
            data-aos="flip-up"
            className="flex w-[500px]  bg-white p-8 rounded-xl relative my-4 md:mx-6  shadow-xl"
          >
            <div className="">
              <PsychologyIcon className="" />
            </div>
            <div className="flex-row mx-4 ">
              <Link href={"/services/6587bd817a2ebd09d835bd1b"}>
                <div>
                  <h1 className="bolder text-2xl font-semibold md:text-4xl">
                    Pelvic and Complex Trauma
                  </h1>
                </div>
                <div className="flex mt-4 text-lg items-end">
                  <span>
                    A pelvic fracture involves the breakage of pelvic bones,
                    such as pelvic ring, acetabulum, and avulsion fractures.
                    Typically caused by high-energy trauma, these fractures can
                    also occur in older individuals due to lower energy
                    incidents.
                  </span>
                  <div className="absolute bottom-0 right-0 bg-primary w-[60px] h-10 rounded-br-xl flex items-center justify-center">
                    <ArrowForwardIcon />
                  </div>
                </div>
              </Link>
            </div>
          </div>
          <div
            data-aos="flip-down"
            className="flex w-[500px]  bg-white p-8 rounded-xl relative my-4 md:mx-6  shadow-xl"
          >
            <div className="">
              <PsychologyIcon className="" />
            </div>
            <div className="flex-row mx-4 ">
              <Link href={"/services/6587bd817a2ebd09d835bd1c"}>
                <div>
                  <h1 className="bolder text-2xl font-semibold md:text-4xl">
                    Rivision Hip Replacement
                  </h1>
                </div>
                <div className="flex mt-4 text-lg items-end">
                  <span>
                    Total hip replacement is highly successful, relieving
                    debilitating hip pain and allowing for more active lives. In
                    some cases, a second operation, known as revision total hip
                    replacement, may be recommended to replace parts of the
                    original prosthesis that have failed over time.
                  </span>
                  <div className="absolute bottom-0 right-0 bg-primary w-[60px] h-10 rounded-br-xl flex items-center justify-center">
                    <ArrowForwardIcon />
                  </div>
                </div>
              </Link>
            </div>
          </div>
          <div
            data-aos="flip-down"
            className="flex w-[500px]  bg-white p-8 rounded-xl relative my-4 md:mx-6  shadow-xl"
          >
            <div className="">
              <PsychologyIcon className="" />
            </div>
            <div className="flex-row mx-4 ">
              <Link href={"/services/6587bd827a2ebd09d835bd1d"}>
                <div>
                  <h1 className="bolder text-2xl font-semibold md:text-4xl">
                    Knee replacement surgery
                  </h1>
                </div>
                <div className="flex mt-4 text-lg items-end">
                  <span>
                    procedure involves replacing damaged bone and cartilage with
                    a metal and plastic artificial joint. An orthopedic surgeon
                    assesses your knee condition using factors like range of
                    motion, stability, and strength, with X-rays determining the
                    extent of damage.
                  </span>
                  <div className="absolute bottom-0 right-0 bg-primary w-[60px] h-10 rounded-br-xl flex items-center justify-center">
                    <ArrowForwardIcon />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
