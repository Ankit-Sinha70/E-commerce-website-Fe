import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types"; // 💡 IMPORT: For prop validation
import { CheckCircle, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

// 💡 REFACTOR: Create a reusable component for animated elements
const AnimatedElement = ({
  as,
  children,
  isVisible,
  delay,
  className = "",
  ...props
}) => {
  const ComponentToRender = as || "div";
  const animationClass = isVisible ? "animate-fade-in-up" : "opacity-0";
  const style = { animationDelay: delay };

  return (
    <div className="overflow-hidden">
      {" "}
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

// Define prop types for the new component for good measure
AnimatedElement.propTypes = {
  as: PropTypes.elementType,
  children: PropTypes.node.isRequired,
  isVisible: PropTypes.bool.isRequired,
  delay: PropTypes.string.isRequired,
  className: PropTypes.string,
};

const AddToCartConfirmationPopup = ({
  isVisible,
  productName,
  quantity,
  onClose,
}) => {
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
      }, 500);
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

  const overlayClasses = `fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-500 ${
    isVisible ? "opacity-100" : "opacity-0"
  }`;
  const modalClasses = `relative bg-white rounded-xl p-8 shadow-2xl max-w-sm w-full mx-4 transform transition-all duration-500 ${
    isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"
  }`;
  const BurstParticle = ({ className, style }) => (
    <div
      className={`absolute top-1/2 left-1/2 w-2 h-8 bg-green-500 rounded-full ${className}`}
      style={style}
    />
  );
  const handleViewCart = () => {
    onClose();
    navigate("/cart");
  };

  return (
    <div
      className={overlayClasses}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        ref={modalRef}
        tabIndex="-1"
        className={modalClasses}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-5">
            {isVisible && (
              <div className="absolute inset-0">
                {[...Array(8)].map((_, i) => (
                  <BurstParticle
                    key={i}
                    className="animate-burst"
                    style={{
                      transform: `rotate(${i * 45}deg) translateY(-40px)`,
                      animationDelay: `${i * 0.02}s`,
                    }}
                  />
                ))}
              </div>
            )}
            <CheckCircle
              className={`w-20 h-20 text-green-500 mx-auto z-10 relative ${
                isVisible ? "animate-pop-in" : ""
              }`}
            />
          </div>

          <AnimatedElement
            as="h2"
            isVisible={isVisible}
            delay="0.2s"
            className="text-2xl font-bold text-gray-900 mb-2"
            id="dialog-title"
          >
            Added to Cart!
          </AnimatedElement>

          <AnimatedElement
            as="p"
            isVisible={isVisible}
            delay="0.3s"
            className="text-gray-600 mb-6"
          >
            <span className="font-semibold">
              {quantity} x {productName}
            </span>{" "}
            has been added to your cart.
          </AnimatedElement>

          <AnimatedElement
            isVisible={isVisible}
            delay="0.4s"
            className="flex flex-col space-y-3"
          >
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-transform duration-200 hover:scale-105"
              onClick={handleViewCart}
            >
              <ShoppingCart className="w-5 h-5 mr-2" /> View Cart & Checkout
            </Button>
            <Button
              variant="outline"
              className="w-full border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold py-3 rounded-lg transition-transform duration-200 hover:scale-105"
              onClick={onClose}
            >
              Continue Shopping
            </Button>
          </AnimatedElement>
        </div>
      </div>
    </div>
  );
};

// 💡 ROBUSTNESS: Define prop types for the main component
AddToCartConfirmationPopup.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  productName: PropTypes.string.isRequired,
  quantity: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AddToCartConfirmationPopup;
