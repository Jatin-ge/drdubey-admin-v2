"use client";

import React from "react";
import {
  CarouselProvider,
  Slider,
  Slide,
  ButtonBack,
  ButtonNext,
} from "pure-react-carousel";
import "pure-react-carousel/dist/react-carousel.es.css";
import { tr } from "date-fns/locale";
/* Install pure-react-carousel using -> npm i pure-react-carousel */
export const Testimonial = () => {
  return (
    <div className="-z-30">
      <div className="xl:px-20 px-8 py-20 2xl:mx-auto 2xl:container relative ">
        <CarouselProvider
          naturalSlideWidth={100}
          naturalSlideHeight={100}
          isIntrinsicHeight={true}
          totalSlides={4}
          isPlaying={true}
          infinite={true}
          playDirection="forward"
          interval={2000}
        >
          <h1 className="text-5xl font-bold xl:block hidden leading-tight text-gray-800 dark:text-gray-200">
            What our <span className="text-primary">patients</span> are
            <br />
            saying
          </h1>
          <h1 className="text-5xl font-bold xl:hidden block leading-tight lg:leading-10 text-gray-800 dark:text-gray-200">
            What our <span className="text-primary">patients</span> are saying
          </h1>
          <Slider>
            <Slide index={2}>
              <div
                className="flex relative"
                style={{ transform: "translateX(0%)" }}
              >
                <div className="mt-14 md:flex">
                  <div className="relative lg:w-1/2 sm:w-96 xl:h-96 h-80">
                    <img
                      src="/assets/images/patient4.jpg"
                      alt="image of profile"
                      className="w-full h-full flex-shrink-0 object-fit object-cover shadow-lg rounded"
                    />
                    <div className="w-32 md:flex hidden items-center justify-center absolute top-0 -mr-16 -mt-14 right-0 h-32 bg-primary rounded-full">
                      <img
                        src="https://tuk-cdn.s3.amazonaws.com/can-uploader/testimonial-svg1.svg"
                        alt="commas"
                      />
                    </div>
                  </div>
                  <div className="md:w-1/3 lg:w-1/3 xl:ml-32 md:ml-20 md:mt-0 mt-4 flex flex-col justify-between">
                    <div>
                      <h1 className="text-2xl font-semibold xl:leading-loose text-gray-800 dark:text-gray-200">
                        Some of the best work that was done!
                      </h1>
                      <p className="text-lg font-medium md:text-2xl leading-6 mt-4 text-gray-600 dark:text-gray-300">
                        Dr dheeraj dubey is the best doctor with knee
                        replacement their team work is excellent my mother did
                        not face any problem while staying there the doctor and
                        his team are best excellent
                      </p>
                    </div>
                    <div className="md:mt-0 mt-8">
                      <p className="text-2xl font-semibold leading-4 text-primary">
                        Rajendra Savita
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Slide>
            <Slide index={3}>
              <div
                className="flex relative"
                style={{ transform: "translateX(0%)" }}
              >
                <div className="mt-14 md:flex">
                  <div className="relative lg:w-1/2 sm:w-96 xl:h-96 h-80">
                    <img
                      src="/assets/images/patient5.webp"
                      alt="image of profile"
                      className="w-full h-full flex-shrink-0 object-fit object-cover shadow-lg rounded"
                    />
                    <div className="w-32 md:flex hidden items-center justify-center absolute top-0 -mr-16 -mt-14 right-0 h-32 bg-primary rounded-full">
                      <img
                        src="https://tuk-cdn.s3.amazonaws.com/can-uploader/testimonial-svg1.svg"
                        alt="commas"
                      />
                    </div>
                  </div>
                  <div className="md:w-1/3 lg:w-1/3 xl:ml-32 md:ml-20 md:mt-0 mt-4 flex flex-col justify-between">
                    <div>
                      <h1 className="text-2xl font-semibold xl:leading-loose text-gray-800 dark:text-gray-200">
                        Some of the best work that was done!
                      </h1>
                      <p className="text-base md:text-2xl font-medium leading-6 mt-4 text-gray-600 dark:text-gray-300">
                        I went to dr dheeraj dubey for my father knee
                        replacement surgery. Amazing and very polite doctor. My
                        father is completely fine now and walking properly.
                      </p>
                    </div>
                    <div className="md:mt-0 mt-8">
                      <p className="text-2xl  font-semibold leading-4 text-primary">
                        Sakshi Jain
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Slide>
            <Slide index={0} tabIndex={1}>
              <div className="flex">
                <div className="mt-14 md:flex">
                  <div className="relative lg:w-1/2 sm:w-96 xl:h-96 h-80">
                    <img
                      src="/assets/images/patient1.webp"
                      alt="image of profile"
                      className="w-full h-full flex-shrink-0 object-fit object-cover shadow-lg rounded"
                    />
                    <div className="w-32 md:flex hidden items-center justify-center absolute top-0 -mr-16 -mt-14 right-0 h-32 bg-primary rounded-full">
                      <img
                        src="https://tuk-cdn.s3.amazonaws.com/can-uploader/testimonial-svg1.svg"
                        alt="commas"
                      />
                    </div>
                  </div>
                  <div className="md:w-1/3 lg:w-1/3 xl:ml-32 md:ml-20 md:mt-0 mt-4 flex flex-col justify-between">
                    <div>
                      <h1 className="text-2xl font-semibold xl:leading-loose text-gray-800 dark:text-gray-200 ">
                        Some of the best work that was done!
                      </h1>
                      <p className="text-base md:text-2xl font-medium leading-6 mt-4 text-gray-600 dark:text-gray-200">
                        Dr dheeraj dubay amazing Dr with great work and best
                        knee and hip replacement surgeon in shalby hospital
                        jaipur.
                      </p>
                    </div>
                    <div className="md:mt-0 mt-8">
                      <p className="text-2xl font-semibold leading-4 text-primary">
                        RamChandra Chaudhry
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Slide>
            <Slide index={1}>
              <div
                className="flex relative"
                style={{ transform: "translateX(0%)" }}
              >
                <div className="mt-14 md:flex">
                  <div className="relative lg:w-1/2 sm:w-96 xl:h-96 h-80">
                    <img
                      src="/assets/images/patient3.jpg"
                      alt="image of profile"
                      className="w-full h-full flex-shrink-0 object-fit object-cover shadow-lg rounded"
                    />
                    <div className="w-32 md:flex hidden items-center justify-center absolute top-0 -mr-16 -mt-14 right-0 h-32 bg-primary rounded-full">
                      <img
                        src="https://tuk-cdn.s3.amazonaws.com/can-uploader/testimonial-svg1.svg"
                        alt="commas"
                      />
                    </div>
                  </div>
                  <div className="md:w-1/3 lg:w-1/3 xl:ml-32 md:ml-20 md:mt-0 mt-4 flex flex-col justify-between">
                    <div>
                      <h1 className="text-2xl font-semibold xl:leading-loose text-gray-800 dark:text-gray-200">
                        Some of the best work that was done!
                      </h1>
                      <p className="text-base md:text-2xl font-medium leading-6 mt-4 text-gray-600 dark:text-gray-300">
                        Dr dheeraj best knee and hip surgeon in shalby Hospital.
                        My mother is complety fine now and is able to walk
                        properly without any pain that used to be earlier.
                      </p>
                    </div>
                    <div className="md:mt-0 mt-8">
                      <p className="text-2xl  font-semibold leading-4 text-primary">
                        Shashi Sharma
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Slide>
          </Slider>
          <div className="flex items-center mt-8">
            <ButtonBack
              className="cursor-pointer bg-cyan-200 rounded-full p-4 "
              role="button"
              aria-label="previous slide"
            >
              <img
                src="https://tuk-cdn.s3.amazonaws.com/can-uploader/testimonal-svg2.svg"
                alt="previous"
              />
            </ButtonBack>

            <ButtonNext
              role="button"
              aria-label="next slide"
              className="cursor-pointer bg-primary rounded-full p-4 ml-2"
            >
              <img
                src="https://tuk-cdn.s3.amazonaws.com/can-uploader/testimonial-svg3.svg"
                alt="next"
              />
            </ButtonNext>
          </div>
        </CarouselProvider>
      </div>
    </div>
  );
};
