import { useState } from "react";
import type { Address } from "../models/types/user";
import { addressesService } from "../services/db";

/**
 * Add Address Controller Hook
 * Handles business logic for adding new addresses
 */

export function useAddAddressController() {
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setLabel("");
    setAddress("");
    setCity("");
    setProvince("");
    setPostalCode("");
    setIsDefault(false);
    setError("");
  };

  const handleAddAddress = async (userId: string): Promise<boolean> => {
    // Validation
    if (!label.trim() || !address.trim() || !city.trim() || !province.trim() || !postalCode.trim()) {
      setError("Please fill in all fields");
      return false;
    }

    if (label.length > 20) {
      setError("Label must be 20 characters or less");
      return false;
    }

    setIsLoading(true);
    setError("");

    try {
      const newAddress: Omit<Address, "id"> = {
        label: label.trim(),
        address: address.trim(),
        city: city.trim(),
        province: province.trim(),
        postalCode: postalCode.trim(),
        isDefault,
      };

      const addressId = await addressesService.createAddress(userId, newAddress);
      console.log("Address created successfully:", addressId);
      resetForm();
      return true;
    } catch (err: any) {
      console.error("Error adding address:", err);
      setError(String(err?.message || err || "Failed to add address"));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    label,
    setLabel,
    address,
    setAddress,
    city,
    setCity,
    province,
    setProvince,
    postalCode,
    setPostalCode,
    isDefault,
    setIsDefault,
    error,
    setError,
    isLoading,
    handleAddAddress,
    resetForm,
  };
}
