import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image1 from "./../assets/images/fashion-image-1.jpg";
import Image2 from "./../assets/images/fashion-image-2.jpg";
import Image3 from "./../assets/images/fashion-image-3.jpg";
import Image4 from "./../assets/images/fashion-image-4.jpg";
import Audiosystem from "./../assets/images/audio-system.jpg"
import smartphones from "./../assets/images/smartphones.jpg";
import homeAppliances from "./../assets/images/home-appliance.jpg";
import { ArrowRight, ChevronLeft, ChevronRight, ShoppingBag, Smartphone, Zap, Percent } from "lucide-react";

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Slider data
  const slides = [
    {
      id: 1,
      brand: "MIVI",
      title: "Discover Premium Fashion for the Whole Family",
      subtitle: "Explore our curated collection of stylish clothing for men, women, and kids.",
      discount: "Up to 60% Off",
       bgColor: "from-gray-500 to-gray-600",
      productImage: Image1,
      productType: "audio",
      icon: <Zap className="w-8 h-8" />
    },
    {
      id: 2,
      brand: "LG",
      title: "Discover Premium Fashion for the Whole Family",
      subtitle: "Explore our curated collection of stylish clothing for men, women, and kids.",
      discount: "Up to 22% Off",
       bgColor: "from-gray-500 to-gray-600",
      productImage: Image2,
      productType: "appliance",
      icon: <ShoppingBag className="w-8 h-8" />
    },
    {
      id: 3,
      brand: "SAMSUNG",
      title: "Discover Premium Fashion for the Whole Family",
      subtitle: "Explore our curated collection of stylish clothing for men, women, and kids.",
      discount: "Up to 40% Off",
       bgColor: "from-gray-500 to-gray-600",
      productImage: Image3,
      productType: "smartphone",
      icon: <Smartphone className="w-8 h-8" />
    },
    {
      id: 4,
      brand: "CAMERA",
      title: "Discover Premium Fashion for the Whole Family",
      subtitle: "Explore our curated collection of stylish clothing for men, women, and kids.",
      discount: "Up to 40% Off",
      bgColor: "from-gray-500 to-gray-600",
      productImage: Image4,
      productType: "smartphone",
      icon: <Smartphone className="w-8 h-8" />
    }
  ];

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative min-h-screen max-w-full overflow-hidden bg-[#111827] pt-16 md:pt-20 m-1 md:m-2 lg:m-3 rounded-xl">
      {/* Main Slider */}
      <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden mt-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
              index === currentSlide ? 'translate-x-0' : 
              index < currentSlide ? '-translate-x-full' : 'translate-x-full'
            }`}
          >
            <div className={`w-full h-full bg-gradient-to-r ${slide.bgColor} flex items-center justify-between px-4 md:px-8 lg:px-16`}>
              {/* Left Content */}
              <div className="flex-1 text-gray-300 z-10">
                <div className="flex items-center gap-2 mb-4">
                  {slide.icon}
                  <span className="text-2xl md:text-3xl font-bold">{slide.brand}</span>
                </div>
                <h2 className="font-bold text-gray-300 tracking-tight leading-snug kaushan-script-regular mb-2">
                  {slide.title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 mb-4 max-w-xl leading-relaxed kaushan-script-regular1 opacity-90">
                  {slide.subtitle}
                </p>
                <div className="flex items-center gap-2 mb-6">
                  <Percent className="w-5 h-5" />
                  <span className="text-lg md:text-xl font-semibold">{slide.discount}</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-start items-start">
                  <Button
                    size="sm"
                    className="w-full sm:w-auto bg-gray-400 text-gray-800 hover:bg-blue-50 font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl text-xs sm:text-sm"
                  >
                    Shop Now
                    <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto bg-gray-400 text-gray-800 hover:bg-blue-50 font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl text-xs sm:text-sm"
                  >
                    Explore Collections
                  </Button>
                </div>
              </div>

              {/* Right Product Image */}
              <div className="flex-1 flex justify-center items-center">
                <div className="relative">
                  <img
                    src={slide.productImage}
                    alt={`${slide.brand} Product`}
                    className="w-56 md:w-72 lg:w-96 h-40 md:h-56 lg:h-72 object-cover rounded-lg shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300"
                  />
                  <div className="absolute -inset-4 bg-white/10 rounded-lg blur-xl" />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200 z-20"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-200 z-20"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Sale Badge */}
        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse z-20">
          FREEDOM SALE
        </div>
      </div>

      {/* Product Showcase Section */}
      <div className="py-4 md:py-8 lg:py-8 px-4 md:px-8 lg:px-16 bg-[#111827]">
        <div className="text-center mb-4 md:mb-6">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-400 kaushan-script-regular3">
            Top Selling Products
          </h2>
          <p className="text-gray-400 text-sm md:text-base lg:text-lg kaushan-script-regular2">
            Latest Technology, Best Brands
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Product Card 1 */}
          <div className="bg-gradient-to-br from-yellow-100 to-green-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-800">Audio Systems</h3>
              <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                60% OFF
              </div>
            </div>
            <div className="relative mb-4">
              <img
                src={Audiosystem}
                alt="Audio System"
                className="w-full h-32 md:h-40 object-cover rounded-lg"
              />
            </div>
            <Button className="w-full bg-gray-800 text-white hover:bg-gray-700 rounded-full">
              View Products
            </Button>
          </div>

          {/* Product Card 2 */}
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-800">Smartphones</h3>
              <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                40% OFF
              </div>
            </div>
            <div className="relative mb-4 flex justify-center">
              <div className="grid grid-cols-2 gap-2">
                <img
                  src={smartphones}
                  alt="Phone 1"
                  className="w-20 md:w-24 h-28 md:h-32 object-cover rounded-lg transform rotate-12"
                />
                <img
                  src={smartphones}
                  alt="Phone 2"
                  className="w-20 md:w-24 h-28 md:h-32 object-cover rounded-lg transform -rotate-12"
                />
              </div>
            </div>
            <Button className="w-full bg-gray-800 text-white hover:bg-gray-700 rounded-full">
              View Products
            </Button>
          </div>

          {/* Product Card 3 */}
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 md:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-800">Home Appliances</h3>
              <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                22% OFF
              </div>
            </div>
            <div className="relative mb-4">
              <img
                src={homeAppliances}
                alt="Home Appliance"
                className="w-full h-32 md:h-40 object-cover rounded-lg"
              />
            </div>
            <Button className="w-full bg-gray-800 text-white hover:bg-gray-700 rounded-full">
              View Products
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Partners */}
      <div className="bg-[#111827] py-6 px-4 md:px-8 lg:px-16">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
          <div className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg">
            <span className="font-bold">ICICI Bank</span>
          </div>
          <div className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg">
            <span className="font-bold">BOB Card</span>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow">
            <span className="text-gray-700 font-semibold">10% Instant Discount</span>
          </div>
        </div>
      </div>

      {/* Floating Animation Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 5}s`,
            }}
          >
            <ShoppingBag className="w-4 h-4 text-gray-300/30" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;