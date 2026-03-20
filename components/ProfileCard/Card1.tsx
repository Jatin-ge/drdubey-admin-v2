import React from "react";
import { Stats } from "../Stats/Stats";
import Image from "next/image";

type Props = {};

const Card1 = (props: Props) => {
  return (
    <div>
      <section className="pt-10 overflow-hidden bg-[#F4FEFA] dark:bg-inherit  py-8 md:pt-0 sm:pt-16 2xl:pt-16">
        <div className="lg:w-[85%] px-4 mx-auto sm:px-6 lg:px-8 ">
          <div className="grid items-center grid-cols-1 md:grid-cols-2">
            <div data-aos="fade-right">
              <h2 className="text-3xl font-bold leading-tight text-gray-700 sm:text-5xl lg:text-7xl dark:text-gray-100">
                Dr. Dheeraj Dubay
              </h2>
              <p className="max-w-3xl mt-3 text-xl lg:text-3xl leading-relaxed text-gray-600 dark:text-gray-200 md:mt-8">
                Sr. Consultant Joint Replacement Surgery - Shalby
                Multi-Specialty Hospitals Jaipur
              </p>
              <li className="mx-1 font-semibold text-xl text-gray-600 mt-4">
                MBBS, MS (Orthopedic), FJRS (Germany)
              </li>
              <p className="max-w-4xl mt-3 text-xl lg:text-2xl leading-relaxed text-gray-600 dark:text-gray-300 md:mt-8">
                He has more than 15 years of experience in the field of Joint
                Replacement Surgeries and is well wersed with latest techniques
                such as computer navigation and minimally invasive surgeries.
                Now he is performing replacement surgeries at Shalby
                Multi-Specialty Hospital, Jaipur. He has done more than 18000
                successful Joint Replacement Surgeries. Record of 17 joint
                replacement surgeries in a day in Rajasthan.
              </p>

              <p className="mt-4 text-xl text-gray-600 md:mt-8 dark:text-gray-300">
                <span className="relative inline-block">
                  <span className="absolute inline-block w-full bottom-0.5 h-2 bg-yellow-300"></span>
                  <span className="relative"> Have a question ? </span>
                </span>
                <br className="block sm:hidden" /> Ask me on{" "}
                <a
                  href="https://www.linkedin.com/in/dr-dheeraj-dubay-36399599/"
                  title=""
                  className="transition-all duration-200 text-sky-500 hover:text-sky-600 hover:underline"
                >
                  LinkedIn
                </a>
              </p>
            </div>

            <div data-aos="fade-left" className="relative">
              <img
                className="absolute inset-x-0 bottom-0 -mb-48 -translate-x-1/2 left-1/2"
                src="https://cdn.rareblocks.xyz/collection/celebration/images/team/1/blob-shape.svg"
                alt=""
              />

              <Image
                width={1400}
                height={1400}
                className="relative w-full xl:max-w-lg xl:mx-auto 2xl:origin-bottom 2xl:scale-130"
                src="/assets/images/photo.png"
                alt=""
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Card1;
