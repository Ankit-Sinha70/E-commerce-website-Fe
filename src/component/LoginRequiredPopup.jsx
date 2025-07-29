import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { LogIn, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AnimatedElement = ({
  as,
  children,
  isVisible,
  delay,
  className = "",
  ...props
}) => {
  const ComponentToRender = as || "div";
  const animationClass = isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4";
  const style = { transition: "all 0.3s ease-out", animationDelay: delay };

  return (
    <div className="overflow-hidden">
      <ComponentToRender
        className={`${className} transform-gpu ${animationClass}`}
        style={style}
        {...props}
      >
        {children}
      </ComponentToRender>
    </div>
  );
};

AnimatedElement.propTypes = {
  as: PropTypes.elementType,
  children: PropTypes.node.isRequired,
  isVisible: PropTypes.bool.isRequired,
  delay: PropTypes.string.isRequired,
  className: PropTypes.string,
};

const LoginRequiredPopup = ({ isVisible, onClose }) => {
  const navigate = useNavigate();
  const [shouldRender, setShouldRender] = useState(isVisible);
  const modalRef = useRef(null);
  const returnFocusRef = useRef(null);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      returnFocusRef.current = document.activeElement;
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
    } else {
      const timeoutId = setTimeout(() => {
        setShouldRender(false);
        returnFocusRef.current?.focus();
      }, 500); // Match this with your modal transition duration
      return () => clearTimeout(timeoutId);
    }
  }, [isVisible]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isVisible) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible, onClose]);

  if (!shouldRender) {
    return null;
  }

  const overlayClasses = `fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-sm transition-opacity duration-500 ${
    isVisible ? "opacity-100" : "opacity-0 pointer-events-none" 
  }`;
  const modalClasses = `relative bg-white rounded-xl p-8 shadow-2xl max-w-sm w-full mx-4 transform transition-all duration-500 ${
    isVisible ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-0 translate-y-4"
  }`;

  const handleLogin = () => {
    onClose();
    navigate("/login");
  };

  return (
    <div
      className={overlayClasses}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-dialog-title"
    >
      <div
        ref={modalRef}
        tabIndex="-1"
        className={modalClasses}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <AnimatedElement isVisible={isVisible} delay="0.1s" as="div" className="w-20 h-20 mx-auto mb-5 flex items-center justify-center">
             <ShoppingCart className="w-16 h-16 text-blue-500" />
          </AnimatedElement>

          <AnimatedElement
            as="h2"
            isVisible={isVisible}
            delay="0.2s"
            className="text-2xl font-bold text-gray-900 mb-2"
            id="login-dialog-title"
          >
            Login Required
          </AnimatedElement>

          <AnimatedElement
            as="p"
            isVisible={isVisible}
            delay="0.3s"
            className="text-gray-600 mb-6"
          >
            You need to be logged in to add products to your cart.
          </AnimatedElement>

          <AnimatedElement
            isVisible={isVisible}
            delay="0.4s"
            className="flex flex-col space-y-3"
          >
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-transform duration-200 hover:scale-105"
              onClick={handleLogin}
            >
              <LogIn className="w-5 h-5 mr-2" /> Login Now
            </Button>
            <Button
              variant="outline"
              className="w-full border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold py-3 rounded-lg transition-transform duration-200 hover:scale-105"
              onClick={onClose}
            >
              Cancel
            </Button>
          </AnimatedElement>
        </div>
      </div>
    </div>
  );
};

LoginRequiredPopup.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default LoginRequiredPopup; 