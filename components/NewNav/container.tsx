
"use client"
import React from "react";
interface ContainerProps{
  props: {
    className: string
    children: React.ReactNode
    
  }
}


const Container = (
  {props}: ContainerProps
) => {
  return (
    <div
      className={`container p-8 mx-auto xl:px-0 ${
        props.className ? props.className : ""
      }`}>
      {props.children}
    </div>
  );
}

export default Container;