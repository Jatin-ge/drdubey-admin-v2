"use client";
import Link from "next/link";
import ThemeChanger from "./DarkSwitch";
import Image from "next/image";
import { Disclosure } from "@headlessui/react";
import { UserButton } from "@clerk/nextjs";

const Navbar = () => {
  return (
    <div className="w-full z-10 bg-[#E2FFF5] dark:text-primary ">
      <nav className="container relative flex flex-wrap items-center justify-between p-4 mx-auto lg:justify-between xl:px-0">
        {/* Logo  */}
        <Disclosure>
          {({ open }) => (
            <>
              <div className="flex flex-wrap items-center justify-between w-full lg:w-auto">
                <Link href="/">
                  <span className="flex items-center space-x-2 text-2xl font-medium ">
                    <span>
                      <Image
                        src="/assets/images/logofinalbg.png"
                        alt="N"
                        width={150}
                        height={150}
                        className="w-[60%]"
                      />
                    </span>
                  </span>
                </Link>

                <Disclosure.Button
                  aria-label="Toggle Menu"
                  className="px-2 py-1 ml-auto  rounded-md lg:hidden hover:text-primary focus:text-[#EE8A27]focus:bg-indigo-100 focus:outline-none  dark:focus:bg-trueGray-700"
                >
                  <svg
                    className="w-6 h-6 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    {open && (
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                      />
                    )}
                    {!open && (
                      <path
                        fillRule="evenodd"
                        d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                      />
                    )}
                  </svg>
                </Disclosure.Button>

                <Disclosure.Panel className="flex flex-wrap w-full my-5 lg:hidden text-black">
                  <>
                    <Link
                      href="/"
                      className="w-full px-4 py-2 -ml-4  hover:text-primary focus:focus:bg-indigo-100 dark:focus:bg-gray-800 focus:outline-none"
                    >
                      Home
                    </Link>
                    <Link
                      href="/about"
                      className="w-full px-4 py-2 -ml-4  hover:text-primary focus:focus:bg-indigo-100 dark:focus:bg-gray-800 focus:outline-none"
                    >
                      About-Me
                    </Link>
                    <Link
                      href="/services/6587bd817a2ebd09d835bd1a"
                      className="w-full px-4 py-2 -ml-4  hover:text-primary focus:focus:bg-indigo-100 dark:focus:bg-gray-800 focus:outline-none"
                    >
                      Services
                    </Link>

                    <Link
                      href="/gallery"
                      className="w-full px-4 py-2 -ml-4  hover:text-primary focus:focus:bg-indigo-100 dark:focus:bg-gray-800 focus:outline-none"
                    >
                      Gallery
                    </Link>

                    <Link
                      href="/youtube"
                      className="w-full px-4 py-2 -ml-4  hover:text-primary focus:focus:bg-indigo-100 dark:focus:bg-gray-800 focus:outline-none"
                    >
                      Testimonials
                    </Link>

                    <Link
                      href="/contact"
                      className="w-full px-4 py-2 -ml-4  hover:text-primary focus:focus:bg-indigo-100 dark:focus:bg-gray-800 focus:outline-none"
                    >
                      Contact-Us
                    </Link>
                  </>
                </Disclosure.Panel>
              </div>
            </>
          )}
        </Disclosure>

        {/* menu  */}
        <div className="hidden text-center lg:flex lg:items-center">
          <ul className="items-center justify-end flex-1 pt-6 list-none lg:pt-0 lg:flex font-semibold">
            <li className="mr-3 nav__item">
              <Link
                href="/"
                className="inline-block px-4 py-2 text-lg font-semibold text-gray-800 no-underline rounded-md  hover:text-primary focus:focus:bg-indigo-100 focus:outline-none dark:focus:bg-gray-800"
              >
                Home
              </Link>
            </li>
            <li className="mr-3 nav__item">
              <Link
                href="/about"
                className="inline-block px-4 py-2 text-lg font-semibold text-gray-800 no-underline rounded-md  hover:text-primary focus:focus:bg-indigo-100 focus:outline-none dark:focus:bg-gray-800"
              >
                About-Us
              </Link>
            </li>

            <li className="mr-3 nav__item">
              <Link
                href="/services/6587bd817a2ebd09d835bd1a"
                className="inline-block px-4 py-2 text-lg font-semibold text-gray-800 no-underline rounded-md  hover:text-primary focus:focus:bg-indigo-100 focus:outline-none dark:focus:bg-gray-800"
              >
                Services
              </Link>
            </li>

            <li className="mr-3 nav__item">
              <Link
                href="/gallery"
                className="inline-block px-4 py-2 text-lg font-semibold text-gray-800 no-underline rounded-md  hover:text-primary focus:focus:bg-indigo-100 focus:outline-none dark:focus:bg-gray-800"
              >
                Gallery
              </Link>
            </li>

            <li className="mr-3 nav__item">
              <Link
                href="/youtube"
                className="inline-block px-4 py-2 text-lg font-semibold text-gray-800 no-underline rounded-md  hover:text-primary focus:focus:bg-indigo-100 focus:outline-none dark:focus:bg-gray-800"
              >
                Testimonials
              </Link>
            </li>

            <li className="mr-3 nav__item">
              <Link
                href="/contact"
                className="inline-block px-4 py-2 text-lg font-semibold text-gray-800 no-underline rounded-md  hover:text-primary focus:focus:bg-indigo-100 focus:outline-none dark:focus:bg-gray-800"
              >
                Contact-Us
              </Link>
            </li>
            <li className="mr-3 nav__item">
              <Link
                href="/profile"
                className="inline-block px-4 py-2 text-lg font-semibold text-gray-800 no-underline rounded-md  hover:text-primary focus:focus:bg-indigo-100 focus:outline-none dark:focus:bg-gray-800"
              >
                My Profile
              </Link>
            </li>
          </ul>
        </div>

        <div className="hidden mr-3 space-x-4 lg:flex nav__item text-[#EE8A27]">
          <UserButton afterSignOutUrl="/" />
          <ThemeChanger />
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
