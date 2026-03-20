"use client";

import React, { Component } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ReviewCard from "./ReviewCard";

class Carousel extends Component {
  render() {
    const settingsformd = {
      dots: false,
      infinite: true,
      slidesToShow: 2,
      slidesToScroll: 1,
      autoplay: true,
      speed: 5000,
      autoplaySpeed: 10,
      cssEase: "linear",
    };

    const settingsforsm = {
      dots: false,
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: true,
      speed: 1000,
      autoplaySpeed: 10,
      cssEase: "linear",
    };
    return (
      <div className="md:container md:mx-auto md:px-20 my-20">
        <h2 className="text-center font-bold text-xl md:text-5xl pb-12">
          Here’s what google <span className="text-primary"> reviews</span> says
          !
        </h2>
        <Slider {...settingsformd}>
          <ReviewCard />
          <ReviewCard />
          <ReviewCard />
          <ReviewCard />
          <ReviewCard />
          <ReviewCard />
        </Slider>
      </div>
    );
  }
}

export default Carousel;
