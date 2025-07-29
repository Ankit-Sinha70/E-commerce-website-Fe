import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { X, MapPin, User, Phone, Mail, Home, Building } from "lucide-react";
import {
  getShippingAddresses,
  createShippingAddress,
  updateShippingAddress,
  deleteShippingAddress,
  clearShippingAddressError,
  clearShippingAddressSuccess,
} from "../../features/shippingAddress/shippingAddressSlice";
import Loader from "@/component/common/Loader";
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

// Address type options - make this dynamic
const ADDRESS_TYPES = [
  { value: "Home", label: "Home", icon: Home },
  { value: "Work", label: "Work", icon: Building },
  { value: "Other", label: "Other", icon: MapPin },
];

// Simple validation function to replace Yup
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

const ShippingAddressPage = () => {
  const dispatch = useDispatch();
  const { addresses, loading, error, success } = useSelector(
    (state) => state.shippingAddress
  );

  const [showAddEditForm, setShowAddEditForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
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

  useEffect(() => {
    dispatch(getShippingAddresses());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearShippingAddressSuccess());
      }, 3000);
      return () => clearTimeout(timer);
    }
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearShippingAddressError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error, dispatch]);

  // Validate form data using custom validation
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

  // Handler for showing the "Add New Address" form
  const handleAddClick = () => {
    setEditingAddress(null);
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
    setValidationErrors({});
    setShowAddEditForm(true);
    dispatch(clearShippingAddressError());
  };

  // Handler for canceling the add/edit operation
  const handleCancelClick = () => {
    setShowAddEditForm(false);
    setEditingAddress(null);
    setValidationErrors({});
    dispatch(clearShippingAddressError());
  };

  // Handler for submitting the add/edit form
  const handleSubmit = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // Validate form
    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    if (editingAddress) {
      // If editing an existing address (dispatch update thunk)
      dispatch(
        updateShippingAddress({ id: editingAddress._id, addressData: formData })
      )
        .unwrap()
        .then(() => {
          setShowAddEditForm(false);
          setEditingAddress(null);
          setValidationErrors({});
        })
        .catch((err) => {
          console.error("Failed to update address:", err);
        });
    } else {
      // If adding a new address (dispatch create thunk)
      dispatch(createShippingAddress(formData))
        .unwrap()
        .then(() => {
          setShowAddEditForm(false);
          setEditingAddress(null);
          setValidationErrors({});
        })
        .catch((err) => {
          console.error("Failed to create address:", err);
        });
    }
  };

  // Handler for clicking the "Edit" button for an address
  const handleEditClick = (address) => {
    setEditingAddress(address);
    setFormData({
      fullName: address.fullName,
      phoneNumber: address.phoneNumber,
      addressLine: address.addressLine,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      type: address.type,
      isDefault: address.isDefault,
    });
    setValidationErrors({});
    setShowAddEditForm(true);
    dispatch(clearShippingAddressError());
  };

  // Handler for clicking the "Delete" button for an address
  const handleDeleteClick = async (addressId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this address? This action cannot be undone."
      )
    ) {
      return;
    }
    dispatch(deleteShippingAddress(addressId))
      .unwrap()
      .then(() => {
      })
      .catch((err) => {
        console.error("Failed to delete address:", err);
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-7xl mt-22">

        {/* Loading and Error Indicators */}
        {loading && <Loader message={"Loading Address..."} />}

        {/* Button to Add New Address */}
        {!showAddEditForm && (
          <div className="text-left mb-4">
            <Button
              onClick={handleAddClick}
              className="bg-gradient-to-r from-sky-500 to-sky-600 hover:from-blue-700 hover:to-blue-500 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 inline-flex items-center"
            >
              <MapPin className="h-5 w-5 mr-1" />
              Add New Address
            </Button>
          </div>
        )}

        <div className="text-left mb-2">
          <p className="text-gray-600 mt-2">Manage your delivery addresses</p>
        </div>
        {/* Modal Overlay */}
        {/* Replace the div with shadcn/ui Dialog */}
        <Dialog open={showAddEditForm} onOpenChange={setShowAddEditForm}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl
            [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Modal Header */}
            <DialogHeader className="bg-gradient-to-r from-sky-300 to-sky-400 text-white p-6 rounded-t-2xl relative">
              <div className="flex items-center">
                <MapPin className="h-6 w-6 mr-3" />
                <DialogTitle className="text-2xl font-bold">
                  {editingAddress ? "Edit Address" : "Add New Address"}
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

                {/* Set as Default */}
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
              </div>
            </div>

            {/* Form Actions */}
            <DialogFooter className="flex-row sm:justify-end gap-4 p-6 pt-0">
              <Button
                type="button"
                onClick={handleCancelClick}
                disabled={loading}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Saving..."
                  : editingAddress
                  ? "Update Address"
                  : "Add Address"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Message for no addresses found */}
        {addresses?.length === 0 && !loading && !error && !showAddEditForm && (
          <div className="text-center py-16">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No shipping addresses found</p>
            <p className="text-gray-500 text-sm mt-2">
              Click "Add New Address" to create your first address
            </p>
          </div>
        )}

        {/* List of Existing Shipping Addresses */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses?.map((address) => {
            const typeConfig =
              ADDRESS_TYPES.find((t) => t.value === address.type) ||
              ADDRESS_TYPES[0];
            const TypeIcon = typeConfig.icon;

            return (
              <div
                key={address?._id}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                {address.isDefault && (
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center py-2">
                    <span className="text-sm font-semibold">
                      Default Address
                    </span>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <TypeIcon className="h-6 w-6 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-800">
                      {address?.fullName}
                    </h3>
                    <span className="ml-2 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {address.type}
                    </span>
                  </div>
                  <div className="space-y-2 text-gray-700">
                    <p className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      {address?.addressLine}
                    </p>
                    <p className="ml-6">
                      {address?.city}, {address?.state} {address?.postalCode}
                    </p>
                    <p className="ml-6">{address?.country}</p>
                    <p className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      {address?.phoneNumber}
                    </p>
                  </div>
                  <div className="mt-6 flex space-x-3">
                    <Button
                    variant="outline"
                      onClick={() => handleEditClick(address)}
                      className="flex-1 text-black text-sm py-2 px-4 rounded-lg shadow-md transition duration-200 transform hover:scale-105"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteClick(address._id)}
                      className="flex-1 bg-red-400 hover:bg-red-500 text-white text-sm py-2 px-4 rounded-lg shadow-md transition duration-200 transform hover:scale-105"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShippingAddressPage;
