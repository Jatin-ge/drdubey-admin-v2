import Link from "next/link";
import React, { useState, useEffect } from "react";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import ThemeChanger from "./DarkSwitch";
import { UserButton } from "@clerk/nextjs";

import Image from "next/image";

const Navbar = () => {
  const [nav, setNav] = useState(false);
  const [color, setColor] = useState("transparent");
  const [textColor, setTextColor] = useState("white");

  const handleNav = () => {
    setNav(!nav);
  };

  useEffect(() => {
    const changeColor = () => {
      if (window.scrollY >= 90) {
        setColor("#E2FFF5");
        setTextColor("#000000");
      } else {
        setColor("transparent");
        setTextColor("#ffffff");
      }
    };
    window.addEventListener("scroll", changeColor);
  }, []);

  return (
    <div
      style={{ backgroundColor: `${color}` }}
      className="fixed left-0 top-0 w-full z-10 ease-in duration-300"
    >
      <div className="max-w-[1240px] m-auto flex justify-between items-center p-4 hover:text-primary text-white md:text-lg font-semibold">
        <Link href="/">
          <Image
            alt="img"
            height={150}
            width={150}
            src={"/assets/images/logofinalbg.png"}
          />
        </Link>
        <ul style={{ color: `${textColor}` }} className="hidden sm:flex">
          <li className="p-4 hover:text-primary ">
            <Link href="/">Home</Link>
          </li>
          <li className="p-4 hover:text-primary">
            <Link href="/about">About-Us</Link>
          </li>
          <li className="p-4 hover:text-primary">
            <Link href="/#services">Services</Link>
          </li>
          <li className="p-4 hover:text-primary">
            <Link href="/gallery">Gallery</Link>
          </li>
          <li className="p-4 hover:text-primary">
            <Link href="/contact">Contact</Link>
          </li>
          <li className="p-4 hover:text-primary">
            <Link href="/profile">Patient Profile</Link>
          </li>
          <li className="p-4 hover:text-primary">
            <Link href="/youtube">Youtube</Link>
          </li>
          <li className="p-4 hover:text-primary">
            <UserButton afterSignOutUrl="/" />
          </li>
          <li className="p-4 hover:text-primary mb-1">
            <ThemeChanger />
          </li>
        </ul>

        {/* Mobile Button */}
        <div onClick={handleNav} className="block sm:hidden z-10">
          {nav ? (
            <AiOutlineClose size={35} style={{ color: `${textColor}` }} />
          ) : (
            <AiOutlineMenu size={35} style={{ color: `${textColor}` }} />
          )}
        </div>
        {/* Mobile Menu */}
        <div
          className={
            nav
              ? "sm:hidden absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center w-full h-screen bg-primary text-center ease-in duration-300"
              : "sm:hidden absolute top-0 left-[-100%] right-0 bottom-0 flex justify-center items-center w-full h-screen bg-black text-center ease-in duration-300"
          }
        >
          <ul>
            <li
              onClick={handleNav}
              className="p-4 hover:text-primary text-4xl hover:text-gray-500"
            >
              <Link href="/">Home</Link>
            </li>
            <li
              onClick={handleNav}
              className="p-4 hover:text-primary text-4xl hover:text-gray-500"
            >
              <Link href="/about">AboutUs</Link>
            </li>
            <li
              onClick={handleNav}
              className="p-4 hover:text-primary text-4xl hover:text-gray-500"
            >
              <Link href="/#services">Services</Link>
            </li>
            <li
              onClick={handleNav}
              className="p-4 hover:text-primary text-4xl hover:text-gray-500"
            >
              <Link href="/gallery">Gallery</Link>
            </li>
            <li
              onClick={handleNav}
              className="p-4 hover:text-primary text-4xl hover:text-gray-500"
            >
              <Link href="/profile">PatientProfile</Link>
            </li>

            <li
              onClick={handleNav}
              className="p-4 hover:text-primary text-4xl hover:text-gray-500"
            >
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
