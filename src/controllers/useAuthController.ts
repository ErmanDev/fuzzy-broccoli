import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

/**
 * Auth Controller Hook
 * Handles business logic for authentication screens
 */

export function useLoginController() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setError("");
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setError("");
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");
    console.log("Attempting login with email:", email.trim());

    const result = await login(email.trim(), password);
    console.log("Login result:", result);

    if (!result.success) {
      console.log("Login failed with error:", result.error);
      setError(result.error || "Login failed");
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  };

  const clearError = () => {
    setError("");
  };

  return {
    email,
    password,
    error,
    isLoading,
    handleEmailChange,
    handlePasswordChange,
    handleLogin,
    clearError,
  };
}

export function useRegisterController() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    setError("");
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setError("");
  };

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    setError("");
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setError("");
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setError("");
  };

  const handlePickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        setError("Permission to access camera roll is required!");
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        // Use string value for mediaTypes (MediaType enum may not be available in all versions)
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setAvatar(result.assets[0].uri);
        setError("");
      }
    } catch (error) {
      setError("Failed to pick image");
    }
  };

  const handleRemoveImage = () => {
    setAvatar(null);
  };

  const handleRegister = async () => {
    // Validation
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    // Register always creates a customer account
    const result = await register(name.trim(), email.trim(), phone.trim(), password, "customer", avatar || undefined);

    if (!result.success) {
      setError(result.error || "Registration failed");
    }

    setIsLoading(false);
  };

  return {
    name,
    email,
    phone,
    password,
    confirmPassword,
    avatar,
    error,
    isLoading,
    handleNameChange,
    handleEmailChange,
    handlePhoneChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handlePickImage,
    handleRemoveImage,
    handleRegister,
  };
}

