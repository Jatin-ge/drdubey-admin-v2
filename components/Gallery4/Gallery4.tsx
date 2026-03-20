import React from "react";

interface Gallery4Props {
  images: string[];
}

const Gallery4: React.FC<Gallery4Props> = ({ images }) => {
  return (
    <section className="flex items-center py-16 bg-gray-100 dark:bg-inherit font-poppins">
      <div className="p-4 mx-auto max-w-[90%]">
        <h2 className="pb-4 text-4xl font-bold text-center text-gray-800 md:text-6xl dark:text-gray-400">
          Our Extended Gallery
        </h2>
        <div className="mx-auto mb-16 border-b border-red-700 w-44 dark:border-gray-400"></div>
        <div className="flex flex-wrap -m-1 md:-m-2">
          {images.map((image, index) => (
            <div key={index} className="w-full px-4 sm:w-1/3">
              <div className="mb-8">
                <a href="#">
                  <div className="relative mb-5 overflow-hidden">
                    <img
                      className="object-cover w-full h-[250px] lg:h-[450px] transition duration-500 group-hover:origin-center hover:scale-105"
                      src={image}
                      alt={`Gallery Image ${index + 1}`}
                    />
                  </div>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery4;
