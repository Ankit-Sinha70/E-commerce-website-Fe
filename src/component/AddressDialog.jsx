import React, { useState, useEffect } from "react";
import { X, MapPin, User, Phone, Mail, Home, Building } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";

// Address type options
const ADDRESS_TYPES = [
  { value: "Home", label: "Home", icon: Home },
  { value: "Work", label: "Work", icon: Building },
  { value: "Other", label: "Other", icon: MapPin },
];

// Validation function
const validateAddressForm = (formData) => {
  const errors = {};

  // Full name validation
  if (!formData.fullName || formData.fullName.trim().length < 2) {
    errors.fullName = "Full name is required and must be at least 2 characters";
  } else if (formData.fullName.length > 50) {
    errors.fullName = "Name must be less than 50 characters";
  }

  // Phone number validation
  if (!formData.phoneNumber) {
    errors.phoneNumber = "Phone number is required";
  } else if (!/^[+]?[\d\s()-]{10,15}$/.test(formData.phoneNumber)) {
    errors.phoneNumber = "Please enter a valid phone number";
  }

  // Address line validation
  if (!formData.addressLine || formData.addressLine.trim().length < 5) {
    errors.addressLine =
      "Address line is required and must be at least 5 characters";
  } else if (formData.addressLine.length > 100) {
    errors.addressLine = "Address must be less than 100 characters";
  }

  // City validation
  if (!formData.city || formData.city.trim().length < 2) {
    errors.city = "City is required and must be at least 2 characters";
  } else if (formData.city.length > 30) {
    errors.city = "City must be less than 30 characters";
  }

  // State validation
  if (!formData.state || formData.state.trim().length < 2) {
    errors.state =
      "State/Province is required and must be at least 2 characters";
  } else if (formData.state.length > 30) {
    errors.state = "State must be less than 30 characters";
  }

  // Postal code validation
  if (!formData.postalCode) {
    errors.postalCode = "Postal code is required";
  } else if (!/^[A-Za-z0-9\s-]{3,10}$/.test(formData.postalCode)) {
    errors.postalCode = "Please enter a valid postal code";
  }

  // Country validation
  if (!formData.country || formData.country.trim().length < 2) {
    errors.country = "Country is required and must be at least 2 characters";
  } else if (formData.country.length > 30) {
    errors.country = "Country must be less than 30 characters";
  }

  // Type validation
  if (
    !formData.type ||
    !ADDRESS_TYPES.some((type) => type.value === formData.type)
  ) {
    errors.type = "Please select a valid address type";
  }

  return errors;
};

const AddressDialog = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
  title = null,
  showDefaultOption = true,
  submitButtonText = null,
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    addressLine: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    type: "Home",
    isDefault: false,
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Initialize form data when dialog opens or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || "",
        phoneNumber: initialData.phoneNumber || "",
        addressLine: initialData.addressLine || "",
        city: initialData.city || "",
        state: initialData.state || "",
        postalCode: initialData.postalCode || "",
        country: initialData.country || "",
        type: initialData.type || "Home",
        isDefault: initialData.isDefault || false,
      });
    } else {
      setFormData({
        fullName: "",
        phoneNumber: "",
        addressLine: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        type: "Home",
        isDefault: false,
      });
    }
    setValidationErrors({});
  }, [initialData, isOpen]);

  // Validate form data
  const validateForm = () => {
    const errors = validateAddressForm(formData);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handler for form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: "",
      });
    }
  };

  // Handler for submitting the form
  const handleSubmit = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // Validate form
    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    // Call the onSubmit callback with form data
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  // Handler for closing the dialog
  const handleClose = () => {
    setValidationErrors({});
    if (onClose) {
      onClose();
    }
  };

  // Determine dialog title
  const dialogTitle = title || (initialData ? "Edit Address" : "Add New Address");

  // Determine submit button text
  const buttonText = submitButtonText || (initialData ? "Update Address" : "Add Address");

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl
        [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* Modal Header */}
        <DialogHeader className="bg-gradient-to-r from-sky-300 to-sky-400 text-white p-6 rounded-t-2xl relative">
          <div className="flex items-center">
            <MapPin className="h-6 w-6 mr-3" />
            <DialogTitle className="text-2xl font-bold">
              {dialogTitle}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Modal Form */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <User className="h-4 w-4 mr-2 text-blue-600" />
                Full Name <span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  validationErrors.fullName
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="Enter your full name"
              />
              {validationErrors.fullName && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.fullName}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <Phone className="h-4 w-4 mr-2 text-blue-600" />
                Phone Number <span className="text-red-500 ml-1">*</span>
              </label>
              <PhoneInput
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={(value) =>
                  handleInputChange({
                    target: {
                      name: "phoneNumber",
                      value: value,
                      type: "text", 
                      checked: false, 
                    },
                  })
                }
                className={`w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  validationErrors.phoneNumber
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="Enter phone number"
              />
              {validationErrors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.phoneNumber}
                </p>
              )}
            </div>

            {/* Address Line */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                Address Line <span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                type="text"
                name="addressLine"
                value={formData.addressLine}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  validationErrors.addressLine
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
                placeholder="123 Main Street, Apt 4B"
              />
              {validationErrors.addressLine && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.addressLine}
                </p>
              )}
            </div>

            {/* City and State Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    validationErrors.city
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="New York"
                />
                {validationErrors.city && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.city}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State / Province{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    validationErrors.state
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="NY"
                />
                {validationErrors.state && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.state}
                  </p>
                )}
              </div>
            </div>

            {/* Postal Code and Country Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    validationErrors.postalCode
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="10001"
                />
                {validationErrors.postalCode && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.postalCode}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                    validationErrors.country
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                  placeholder="United States"
                />
                {validationErrors.country && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.country}
                  </p>
                )}
              </div>
            </div>

            {/* Address Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {ADDRESS_TYPES.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <Button 
                      variant="outline"
                      key={type.value}
                      type="button"
                      onClick={() =>
                        handleInputChange({
                          target: { name: "type", value: type.value },
                        })
                      }
                      className={` ${
                        formData.type === type.value
                          ? "border-blue-600 bg-blue-100 text-blue-600"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <IconComponent className="h-5 w-5 mb-1" />
                      <span className="text-sm font-medium">
                        {type.label}
                      </span>
                    </Button>
                  );
                })}
              </div>
              {validationErrors.type && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.type}
                </p>
              )}
            </div>

            {/* Set as Default - only show if showDefaultOption is true */}
            {showDefaultOption && (
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <Input
                  type="checkbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-3 text-sm font-medium text-gray-700">
                  Set as default address
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <DialogFooter className="flex-row sm:justify-end gap-4 p-6 pt-0">
          <Button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddressDialog;