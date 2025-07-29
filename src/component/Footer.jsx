// File: src/components/Footer.jsx
import { ArrowRight, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, QrCode } from "lucide-react";
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-sky-400 to-sky-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Location Section */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-4">
                <MapPin className="w-6 h-6 text-red-400 mr-2" />
                <h3 className="text-xl font-bold">Our Location</h3>
              </div>
              <p className="text-blue-100 mb-6 leading-relaxed">
                22nd St - Al Quoz - Al Quoz Industrial Area 3 -<br />
                Dubai UAE
              </p>
              
              {/* Map Placeholder */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="w-full h-48 bg-slate-200 rounded-xl flex items-center justify-center text-slate-600">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 mx-auto mb-2 text-red-500" />
                    <p className="font-semibold">Ice Natural Ice Industry LLC</p>
                    <p className="text-sm">Al Quoz Industrial Area 3, Dubai</p>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6 text-orange-400 mr-2" />
                <h3 className="text-xl font-bold">Scan Me</h3>
              </div>
              
              <div className="bg-white p-6 rounded-2xl inline-block shadow-lg">
                <div className="w-48 h-48 bg-black flex items-center justify-center rounded-xl">
                  <div className="text-white text-center">
                    <QrCode className="w-16 h-16 mx-auto mb-2" />
                    <p className="text-xs">QR Code</p>
                    <p className="text-xs">Scan for more info</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-4">
                <Phone className="w-6 h-6 text-green-400 mr-2" />
                <h3 className="text-xl font-bold">Contact Us</h3>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-center md:justify-start">
                  <Phone className="w-5 h-5 text-orange-400 mr-3" />
                  <a href="tel:+97156533420" className="text-blue-100 hover:text-white transition-colors">
                    056 533 4200
                  </a>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <Mail className="w-5 h-5 text-blue-400 mr-3" />
                  <a href="mailto:info@icenatural.com" className="text-blue-100 hover:text-white transition-colors">
                    info@icenatural.com
                  </a>
                </div>
              </div>

              {/* Social Media Icons */}
              <div className="flex justify-center md:justify-start space-x-4">
                <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 transform hover:scale-110">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 transform hover:scale-110">
                  <div className="w-5 h-5 flex items-center justify-center text-sm font-bold">T</div>
                </a>
                <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 transform hover:scale-110">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 transform hover:scale-110">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-white/20 mt-12 pt-8 text-center">
            <p className="text-blue-100 mb-4">
              © 2025 Natural Ice. All rights reserved.
            </p>
            <div className="flex justify-center space-x-4 text-sm">
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <span className="text-blue-300">|</span>
              <a href="#" className="text-blue-200 hover:text-white transition-colors">
                Terms of Use
              </a>
            </div>
          </div>

          {/* Scroll to top button */}
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-50"
          >
            <ArrowRight className="w-5 h-5 transform -rotate-90" />
          </button>
        </div>
      </footer>
  );
};

export default Footer;
