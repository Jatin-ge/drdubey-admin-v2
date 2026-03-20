import React from "react";
import {
  FaceSmileIcon,
  ChartBarSquareIcon,
  CursorArrowRaysIcon,
  DevicePhoneMobileIcon,
  AdjustmentsHorizontalIcon,
  SunIcon,
} from "@heroicons/react/24/solid";

type Props = {};

import Container from "../Hero/Container";
import Image from "next/image";

const bullets = [
  {
    title: "Understand your customers",
    desc: "Then explain the first point breifly in one or two lines.",
    icon: <FaceSmileIcon />,
  },
  {
    title: "Improve acquisition",
    desc: "Here you can add the next benefit point.",
    icon: <ChartBarSquareIcon />,
  },
  {
    title: "Drive customer retention",
    desc: "This will be your last bullet point in this section.",
    icon: <CursorArrowRaysIcon />,
  },
];

// what do you keep turn around for sure things keep ready ashutosh nautiyal ashutosh nautiyal

export const Benefits = (props: Props) => {
  return (
    <>
      <Container className="flex flex-wrap mb-20 lg:gap-10 lg:flex-nowrap">
        <div className="flex items-center justify-center w-full lg:w-1/2 lg:order-1 ">
          <div>
            <Image
              src={"/assets/images/drdubay.png"}
              width="521"
              height="521"
              alt="Benefits"
              className={"object-cover"}
              //   placeholder="blur"
              //   blurDataURL={data.image.src}
            />
          </div>
        </div>

        <div
          className={`flex flex-wrap items-center w-full lg:w-1/2 
           lg:justify-end
          `}
        >
          <div>
            <div className="flex flex-col w-full mt-4">
              <h3 className="max-w-2xl mt-3 text-3xl font-bold leading-snug tracking-tight text-gray-800 lg:leading-tight lg:text-4xl dark:text-white">
                This is the title
              </h3>

              <p className="max-w-2xl py-4 text-lg leading-normal text-gray-500 lg:text-xl xl:text-xl dark:text-gray-300">
                This is the description
              </p>
            </div>

            <div className="w-full mt-5">
              {bullets.map((bullet) => (
                <Benefit
                  key={bullet.title}
                  title={bullet.title}
                  icon={bullet.icon}
                >
                  {bullet.desc}
                </Benefit>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </>
  );
};

function Benefit(props: any) {
  return (
    <>
      <div className="flex items-start mt-8 space-x-3">
        <div className="flex items-center justify-center flex-shrink-0 mt-1 bg-indigo-500 rounded-md w-11 h-11 ">
          {React.cloneElement(props.icon, {
            className: "w-7 h-7 text-indigo-50",
          })}
        </div>
        <div>
          <h4 className="text-xl font-medium text-gray-800 dark:text-gray-200">
            {props.title}
          </h4>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {props.children}
          </p>
        </div>
      </div>
    </>
  );
}
