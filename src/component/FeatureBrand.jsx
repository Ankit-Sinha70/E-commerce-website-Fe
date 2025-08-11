import React, { useState, useEffect } from "react";
import Samsung from "../assets/images/samsung-mobile.jpg";
import Nike from "../assets/images/Nike.jpg";
import Boat from "../assets/images/Boat.jpg";
import Iphone from "../assets/images/Apple15pro.jpg";
import Noise from "../assets/images/Noisefit.jpg";
import Reebok from "../assets/images/Reebok.jpg";
import AppleAirpods from "../assets/images/AppleAirpods.jpg";
import { ChevronLeft, ChevronRight } from "lucide-react";

const FeaturedBrandsSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(3);

  const featuredProducts = [
    {
      id: 1,
      brand: "NOISE",
      title: "Twist Go",
      subtitle: "Big Freedom. Bigger Deals.",
      price: "Just ₹1,399",
      bgColor: "bg-black",
      textColor: "text-white",
      image: Noise,
      accent: "text-orange-500",
    },
    {
      id: 2,
      brand: "NIKE",
      title: "Air Max 270",
      subtitle: "Comfort Meets Style",
      description: "Responsive cushioning with a modern look",
      price: "From ₹7,499",
      textColor: "text-white",
      image: Nike,
      accent: "text-orange-500",
      flag: true,
    },

    {
      id: 4,
      brand: "SAMSUNG",
      title: "Galaxy S25",
      subtitle: "Every shot counts",
      description: "50MP Camera",
      price: "From ₹72,999",
      bgColor: "bg-black",
      textColor: "text-white",
      image: Samsung,
      accent: "text-orange-500",
    },
    {
      id: 5,
      brand: "APPLE",
      title: "iPhone 15",
      subtitle: "Titanium. So strong. So light.",
      price: "From ₹79,900",
      bgColor: "bg-gradient-to-r from-blue-900 to-purple-900",
      textColor: "text-gray-500",
      image: Iphone,
      accent: "text-blue-400",
    },
    {
      id: 6,
      brand: "BOAT",
      title: "Airdopes 141",
      subtitle: "Wireless Earbuds",
      description: "50 Hours Playback",
      price: "Just ₹1,299",
      bgColor: "bg-gradient-to-r from-red-600 to-red-700",
      textColor: "text-white",
      image: Boat,
      accent: "text-yellow-400",
    },
    {
      id: 6,
      brand: "REEBOK",
      title: "Runner V5",
      subtitle: "Men's Running Shoes",
      description: "Durable & Lightweight Comfort",
      price: "Starting at ₹2,999",
      bgColor: "bg-gradient-to-r from-blue-800 to-blue-900",
      textColor: "text-white",
      image: Reebok,
      accent: "text-yellow-300",
    },
    {
      id: 7,
      brand: "APPLE",
      title: "AirPods Pro",
      subtitle: "Active Noise Cancellation",
      description: "Immersive Sound Experience",
      price: "From ₹20,999",
      bgColor: "bg-gradient-to-r from-gray-800 to-gray-900",
      textColor: "text-white",
      image: AppleAirpods, // Make sure to import the image like: import AppleAirpods from 'path-to-image';
      accent: "text-blue-400",
    },
  ];

  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerView(3);
      } else if (window.innerWidth >= 768) {
        setItemsPerView(2);
      } else {
        setItemsPerView(1);
      }
    };

    updateItemsPerView();
    window.addEventListener("resize", updateItemsPerView);
    return () => window.removeEventListener("resize", updateItemsPerView);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev >= featuredProducts.length - itemsPerView ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev <= 0 ? featuredProducts.length - itemsPerView : prev - 1
    );
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="w-full max-w-8xl mx-auto px-2 py-2">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-400 mb-6 text-center">
        Featured Brands
      </h2>

      <div className="relative">
        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors duration-200 -ml-4"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors duration-200 -mr-4"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>

        {/* Slider Container */}
        <div className="overflow-hidden rounded-lg">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${currentSlide * (100 / itemsPerView)}%)`,
              width: `${(featuredProducts.length / itemsPerView) * 100}%`,
            }}
          >
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 px-2"
                style={{ width: `${100 / featuredProducts.length}%` }}
              >
                <div
                  className="relative rounded-lg overflow-hidden h-64 md:h-72 lg:h-80 flex flex-col justify-between p-6 group cursor-pointer hover:shadow-xl transition-shadow duration-300"
                  style={{
                    backgroundImage: `url(${product.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundColor: "transparent", // Ensure background fallback is not black
                  }}
                >
                  {/* Overlay */}
                  <div className="absolute bg-opacity-30 z-0"></div>

                  {/* Flag decoration */}
                  {product.flag && (
                    <div className="absolute top-0 right-0 z-10">
                      <div className="flex space-x-1">
                        <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-green-500"></div>
                        <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-orange-500"></div>
                        <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-green-500"></div>
                      </div>
                    </div>
                  )}

                  {/* Text Content */}
                  <div className="flex flex-col justify-start z-10 relative">
                    <h3
                      className={`font-bold text-lg md:text-xl ${product.textColor}`}
                    >
                      {product.brand}
                    </h3>
                    <h4
                      className={`font-semibold text-xl md:text-2xl ${product.textColor} mt-1`}
                    >
                      {product.title}
                    </h4>
                    {product.subtitle && (
                      <p
                        className={`text-sm md:text-base ${product.textColor} opacity-90 mt-1`}
                      >
                        {product.subtitle}
                      </p>
                    )}
                    {product.description && (
                      <p
                        className={`text-sm ${product.textColor} opacity-80 mt-2`}
                      >
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mt-auto z-10 relative">
                    <div
                      className={`inline-block px-4 py-2 rounded-lg font-bold text-lg md:text-xl ${product.accent} bg-white bg-opacity-90`}
                    >
                      {product.price}
                    </div>
                  </div>

                  {/* Hover effect layer */}
                  <div className="absolute inset-0 bg-opacity-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({
            length: Math.ceil(featuredProducts.length / itemsPerView),
          }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                currentSlide === index ? "bg-orange-500" : "bg-gray-300"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Auto-scroll hint */}
      <div className="text-center mt-4">
        <p className="text-sm text-gray-500">
          Swipe or use arrows to explore more brands
        </p>
      </div>
    </div>
  );
};

export default FeaturedBrandsSlider;
