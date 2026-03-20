"use client";
import React from "react";
import CountUp from "react-countup";

export const Stats = () => {
  return (
    <div data-aos="" className="mt-8 bg-[#E2FFF5]">
      <div className="max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-12">
          <div
            data-aos="flip-left"
            className="flex flex-col gap-y-3 lg:gap-y-5 p-4 md:p-5 bg-inherit borderhover:scale-110   dark:bg-slate-900 dark:border-gray-800"
          >
            <div className="inline-flex justify-center items-center">
              <span className="w-2 h-2 inline-block bg-gray-500 rounded-full mr-2"></span>
              <span className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                Surgeries in a Day
              </span>
            </div>

            <div className="text-center">
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-800 dark:text-gray-200">
                <CountUp end={17} duration={22} />
              </h3>
            </div>

            <dl className="flex justify-center items-center divide-x divide-gray-200 dark:divide-gray-700">
              <dt className="pr-3">
                <span className="text-green-600">
                  <svg
                    className="inline-block w-4 h-4 self-center"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill-rule="evenodd"
                      d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"
                    />
                  </svg>
                  <span className="inline-block text-sm">1.7%</span>
                </span>
                <span className="block text-sm text-gray-500">change</span>
              </dt>
              <dd className="text-left pl-3">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  5
                </span>
                <span className="block text-sm text-gray-500">last week</span>
              </dd>
            </dl>
          </div>

          <div
            data-aos="flip-left"
            className="flex flex-col gap-y-3 lg:gap-y-5 p-4 md:p-5 bg-inherit borderhover:scale-110  dark:bg-slate-900 dark:border-gray-800"
          >
            <div className="inline-flex justify-center items-center">
              <span className="w-2 h-2 inline-block bg-green-500 rounded-full mr-2"></span>
              <span className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                Successful Surgeries
              </span>
            </div>

            <div className="text-center">
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-800 dark:text-gray-200">
                <CountUp end={18000} duration={22} />+
              </h3>
            </div>

            <dl className="flex justify-center items-center divide-x divide-gray-200 dark:divide-gray-700">
              <dt className="pr-3">
                <span className="text-green-600">
                  <svg
                    className="inline-block w-4 h-4 self-center"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill-rule="evenodd"
                      d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"
                    />
                  </svg>
                  <span className="inline-block text-sm">5.6%</span>
                </span>
                <span className="block text-sm text-gray-500">change</span>
              </dt>
              <dd className="text-left pl-3">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  7
                </span>
                <span className="block text-sm text-gray-500">last week</span>
              </dd>
            </dl>
          </div>

          <div
            data-aos="flip-left"
            className="flex flex-col gap-y-3 lg:gap-y-5 p-4 md:p-5 bg-inherit borderhover:scale-110  dark:bg-slate-900 dark:border-gray-800"
          >
            <div className="inline-flex justify-center items-center">
              <span className="w-2 h-2 inline-block bg-green-500 rounded-full mr-2"></span>
              <span className="text-xs font-semibold uppercase text-gray-600 dark:text-gray-400">
                Happy Patients
              </span>
            </div>

            <div className="text-center">
              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-800 dark:text-gray-200">
                <CountUp end={50000} duration={22} />+
              </h3>
            </div>

            <dl className="flex justify-center items-center divide-x divide-gray-200 dark:divide-gray-700">
              <dt className="pr-3">
                <span className="text-green-600">
                  <svg
                    className="inline-block w-4 h-4 self-center"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill-rule="evenodd"
                      d="m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z"
                    />
                  </svg>
                  <span className="inline-block text-sm">5.6%</span>
                </span>
                <span className="block text-sm text-gray-500">change</span>
              </dt>
              <dd className="text-left pl-3">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  7
                </span>
                <span className="block text-sm text-gray-500">last week</span>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};
