import ContactSection from "@/components/ContactForm/Form2";
import Footer from "@/components/Footer/Footer";
import Navbar from "@/components/Navbar/navbar";
import GoogleMaps from "@/components/ui/map";
import React from "react";

type Props = {};

const page = (props: Props) => {
  return (
    <div>
      <Navbar />
      <ContactSection />
      <GoogleMaps />
      <Footer />
    </div>
  );
};

export default page;
