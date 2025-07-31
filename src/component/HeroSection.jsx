import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag } from "lucide-react";

const HeroSection = () => {
  const numberOfImages = 6; // Adjust the number of images as needed

  return (
    <section className="relative min-h-screen max-w-full flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background image + gradient overlay */}
      <div className="absolute inset-0">
        <div
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('/src/assets/images/fashion-hero-bg.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-purple-800/60 to-slate-900/70" />
      </div>

      {/* Floating particles (replace snowflakes with something fashion-related if desired) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <ShoppingBag
            key={i}
            className="absolute text-white/20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              fontSize: `${Math.random() * 20 + 10}px`,
            }}
          />
        ))}
      </div>

      {/* Fashion Images */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(numberOfImages)].map((_, i) => (
          <img
            key={i}
            src={`/src/assets/images/fashion-image-${i + 1}.jpg`} // Replace with your image paths
            alt={`Fashion ${i + 1}`}
            className="absolute object-cover w-32 h-32 rounded-full animate-fade-in-up" // Added animation class
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 5}s`, // Added animation duration
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center w-full max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <div className="relative inline-block">
            <img
              src="/src/assets/images/fashion-logo.png"
              alt="Premium Clothing"
              className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-4 sm:mb-6 drop-shadow-2xl animate-float"
            />
            <div className="absolute -inset-4 bg-white/10 rounded-full blur-xl animate-pulse" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-snug kaushan-script-regular">
          Discover Premium Fashion for the Whole Family
        </h1>

        <p className="text-sm sm:text-base text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed kaushan-script-regular1">
          Explore our curated collection of stylish clothing for men, women, and kids.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-white text-blue-900 hover:bg-blue-50 font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl text-sm sm:text-base"
          >
            Shop Now
            <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto bg-white text-blue-900 hover:bg-blue-50 font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-xl text-sm sm:text-base"
          >
            Explore Collections
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
        <div className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-2 sm:h-3 bg-white rounded-full mt-1 sm:mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
