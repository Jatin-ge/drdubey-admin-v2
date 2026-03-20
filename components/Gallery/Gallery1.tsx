import React from "react";

const Gallery1: React.FC = () => {
  return (
    <section className="flex items-center py-16 bg-gray-100 dark:bg-inherit font-poppins">
      <div className="p-4 mx-auto max-w-[90%]">
        <h2 className="pb-4 text-4xl font-bold text-center text-gray-800 md:text-6xl dark:text-gray-400">
          Our Gallery
        </h2>
        <div className="mx-auto mb-16 border-b border-red-700 w-44 dark:border-gray-400"></div>
        <div className="flex flex-wrap -m-1 md:-m-2">
          <div className="w-full px-4 sm:w-1/3">
            <div className="mb-8">
              <a href="#">
                <div className="relative mb-5 overflow-hidden">
                  <img
                    className="object-cover w-full h-[250px] lg:h-[450px] transition duration-500 group-hover:origin-center hover:scale-105"
                    src="https://i.postimg.cc/Y23w2gc1/pexels-ricardo-esquivel-1586298.jpg"
                    alt=""
                  />
                </div>
              </a>
            </div>
            <div className="mb-8">
              <a href="#">
                <div className="relative mb-5 overflow-hidden">
                  <img
                    className="object-cover w-full h-[250px] transition duration-500 group-hover:origin-center hover:scale-105"
                    src="https://i.postimg.cc/xTy9B753/pexels-christina-morillo-1181605.jpg"
                    alt=""
                  />
                </div>
              </a>
            </div>
          </div>
          <div className="w-full px-4 sm:w-1/3 ">
            <div className="mb-8">
              <a href="#">
                <div className="relative mb-5 overflow-hidden">
                  <img
                    className="object-cover w-full h-[250px] transition duration-500 group-hover:origin-center hover:scale-105"
                    src="https://i.postimg.cc/fbT9FYhB/pexels-stijn-dijkstra-2583852.jpg"
                    alt=""
                  />
                </div>
              </a>
            </div>
            <div className="mb-8">
              <a href="#">
                <div className="relative mb-5 overflow-hidden">
                  <img
                    className="object-cover w-full h-[250px] lg:h-[450px] transition duration-500 group-hover:origin-center hover:scale-105"
                    src="https://i.postimg.cc/j5L5bX2d/pexels-andrea-piacquadio-3757946.jpg"
                    alt=""
                  />
                </div>
              </a>
            </div>
          </div>
          <div className="w-full px-4 sm:w-1/3 ">
            <div className="mb-8">
              <a href="#">
                <div className="relative mb-5 overflow-hidden">
                  <img
                    className="object-cover w-full h-[250px] lg:h-[450px] transition duration-500 group-hover:origin-center hover:scale-105"
                    src="https://i.postimg.cc/rpbTSLyM/pexels-andrea-piacquadio-3760263.jpg"
                    alt=""
                  />
                </div>
              </a>
            </div>
            <div className="mb-8">
              <a href="#">
                <div className="relative mb-5 overflow-hidden">
                  <img
                    className="object-cover w-full h-[250px] transition duration-500 group-hover:origin-center hover:scale-105"
                    src="https://i.postimg.cc/9MQr82ZS/pexels-james-wheeler-417074-1.jpg"
                    alt=""
                  />
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Gallery1;
