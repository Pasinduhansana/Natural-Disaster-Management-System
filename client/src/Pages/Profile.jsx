import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Camera,
  User,
  Mail,
  MapPin,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Settings,
  Bell,
  Bookmark,
  HelpCircle,
} from "lucide-react";

const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    profileImage: null,
  });
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [activeTab, setActiveTab] = useState("profile");

  // Fetch user data
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/user/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setUser(data);
      setPreviewImage(data.profileImage);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load user data");
    }
  };

  // Handle image upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch("http://localhost:5000/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (data.url) {
          setPreviewImage(data.url);
          setUser({ ...user, profile_img: data.url });
          toast.success("Profile picture uploaded successfully!");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload profile picture");
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle profile update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/users/${user._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(user),
        }
      );

      if (response.ok) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Password validation
  const validatePassword = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    // Reset errors
    setPasswordErrors({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    // Validate fields
    let hasError = false;
    if (!passwords.currentPassword) {
      setPasswordErrors((prev) => ({
        ...prev,
        currentPassword: "Current password is required",
      }));
      hasError = true;
    }

    if (!passwords.newPassword) {
      setPasswordErrors((prev) => ({
        ...prev,
        newPassword: "New password is required",
      }));
      hasError = true;
    } else if (!validatePassword(passwords.newPassword)) {
      setPasswordErrors((prev) => ({
        ...prev,
        newPassword:
          "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character",
      }));
      hasError = true;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
      hasError = true;
    }

    if (hasError) return;

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            currentPassword: passwords.currentPassword,
            newPassword: passwords.newPassword,
          }),
        }
      );

      if (response.ok) {
        toast.success("Password changed successfully!");
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error("Failed to change password");
    }
  };

  // Tab navigation
  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "saved", label: "Saved", icon: Bookmark },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 justify-between">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white">
                  <img
                    src={user.profile_img || "default-avatar.png"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <motion.label
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  htmlFor="profile-image"
                  className="absolute bottom-1 right-1 p-2.5 bg-white rounded-full shadow-md cursor-pointer hover:bg-green-50 border border-gray-100 transition-colors"
                >
                  <Camera className="w-5 h-5 text-green-600" />
                  <input
                    type="file"
                    id="profile-image"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={loading}
                  />
                </motion.label>
              </div>
              <div className="text-center md:text-left text-white h-full mt-6">
                <h1 className="text-3xl font-bold">
                  {user.name || "Your Name"}
                </h1>
                <p className="mt-1 text-green-100">
                  {user.email || "your.email@example.com"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                    {user.role || "Member"}
                  </span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                    Joined{" "}
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "Recently"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right side - Modern Account Status Card with Glassmorphism */}
            <div className="bg-gradient-to-br from-white/15 to-white/10 backdrop-filter backdrop-blur-md border border-white/20 rounded-xl shadow-xl p-5 w-full md:w-64 mt-4 md:mt-0 overflow-hidden relative">
              {/* Decorative circle */}
              <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white/5 blur-2xl"></div>

              <h3 className="text-white text-sm font-semibold mb-4 flex items-center relative z-10">
                <Shield className="h-4 w-4 mr-2 text-white/90" />
                Account Status
              </h3>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <p className="text-white/80 text-xs font-medium">
                    Account Type
                  </p>
                  <span className="px-2.5 py-1 bg-white/15 text-white border border-white/20 rounded-full text-xs font-medium shadow-sm">
                    {user.role || "Standard"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-white/80 text-xs font-medium">
                    Member Since
                  </p>
                  <span className="text-white/90 text-xs">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-white/80 text-xs font-medium">
                    Last Login
                  </p>
                  <span className="text-white/90 text-xs">Today</span>
                </div>
              </div>

              {/* Decorative glow */}
              <div className="absolute -left-4 -bottom-4 w-16 h-16 rounded-full bg-green-500/10 blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b h-10 border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2 flex items-center space-x-2 border-b-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-5 w-5 " />
                <span className="text-[14px]">{tab.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Personal Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex flex-row items-center gap-2">
                    <User className="h-5 w-5 text-green-600 mr-2" />
                    <div className="flex flex-col">
                      <h2 className="text-[18px] font-semibold text-gray-800 flex items-center">
                        Personal Information
                      </h2>
                      <p className="text-gray-500 text-sm text-left ">
                        Update your personal details
                      </p>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 flex flex-col justify-start">
                        <label className="text-[13px] font-medium text-gray-700 text-left w-full pl-4">
                          Full Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={user.name || ""}
                            onChange={(e) =>
                              setUser({ ...user, name: e.target.value })
                            }
                            className="pl-10 w-full py-1.5 px-2.5 text-[14px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent bg-gray-50/50"
                            placeholder="Full Name"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 flex-col justify-start flex  text-left">
                        <label className="text-[13px] font-medium text-gray-700 pl-4">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            value={user.email || ""}
                            onChange={(e) =>
                              setUser({ ...user, email: e.target.value })
                            }
                            className="pl-10 w-full py-1.5 px-2.5 border text-[14px] border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent bg-gray-50/50"
                            placeholder="Email Address"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 flex-col justify-start flex  text-left">
                        <label className="text-[13px] font-medium text-gray-700 pl-4">
                          Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-gray-400"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                          </div>
                          <input
                            type="tel"
                            value={user.phone || ""}
                            onChange={(e) =>
                              setUser({ ...user, phone: e.target.value })
                            }
                            className="pl-10 w-full py-1.5 px-2.5 border text-[14px] border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent bg-gray-50/50"
                            placeholder="Phone Number"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 flex flex-col justify-start text-left">
                        <label className="text-[13px] font-medium text-gray-700 pl-4">
                          Country
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={user.Country || ""}
                            onChange={(e) =>
                              setUser({ ...user, Country: e.target.value })
                            }
                            className="pl-10 w-full py-1.5 px-2.5 border text-[14px] border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent bg-gray-50/50"
                            placeholder="Country"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="flex flex-row items-center justify-around px-2 py-0 text-white font-medium  h-[30px] w-[140px] bg-primary-light hover:bg-hover-light transition-all duration-200 my-2 rounded-[4px] text-[13px]"
                      >
                        {loading ? "Updating..." : "Save Changes"}
                      </motion.button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column - Account Status */}
            <div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-[18px] font-semibold text-gray-800 flex items-center">
                    <Shield className="h-5 w-5  text-green-600 mr-2" />
                    Account Status
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between text-left">
                      <div>
                        <p className="font-medium text-gray-700 text-[14px]">
                          Account Type
                        </p>
                        <p className=" text-gray-500 text-[12px]">
                          Your current plan
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                        Standard
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-left">
                      <div>
                        <p className="font-medium text-gray-700 text-[14px]">
                          Member Since
                        </p>
                        <p className="text-[12px] text-gray-500">Join date</p>
                      </div>
                      <span className="text-[12px] text-gray-600">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-left">
                      <div>
                        <p className="font-medium text-gray-700 text-[14px]">
                          Last Login
                        </p>
                        <p className="text-[12px] text-gray-500">
                          Last activity
                        </p>
                      </div>
                      <span className="text-[12px] text-gray-600">Today</span>
                    </div>

                    <div className="pt-4">
                      <div className="rounded-lg bg-gray-50 p-4 border border-gray-100">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                            <HelpCircle className="h-5 w-5 text-blue-500" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800 text-left text-[14px]">
                              Need Help?
                            </h3>
                            <p className="text-[12px] text-gray-500 mt-0.5">
                              Contact our support team
                            </p>
                          </div>
                        </div>
                        <button className="mt-4 w-full text-sm py-2 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-600 font-medium transition-colors">
                          Contact Support
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <div className=" flex flex-row items-center gap-2">
                    <Lock className="h-5 w-5 text-green-600 mr-2" />
                    <div className="flex-col flex">
                      <h2 className="text-[18px] font-semibold text-gray-800 flex items-center">
                        Change Password
                      </h2>
                      <p className="text-gray-500 text-sm mt-1">
                        Update your password to keep your account secure
                      </p>
                    </div>
                  </div>
                </div>
                <form onSubmit={handlePasswordChange} className="p-6">
                  <div className="space-y-6">
                    <div className="relative">
                      <label className="text-sm font-medium text-gray-700 block mb-2 text-left pl-4">
                        Current Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwords.currentPassword}
                          onChange={(e) =>
                            setPasswords({
                              ...passwords,
                              currentPassword: e.target.value,
                            })
                          }
                          className="pl-10 w-full p-1.5 border text-[14px] border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent bg-gray-50/50"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              current: !showPasswords.current,
                            })
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.current ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {passwordErrors.currentPassword}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <label className="text-sm font-medium text-gray-700 block mb-2 text-left pl-4">
                        New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwords.newPassword}
                          onChange={(e) =>
                            setPasswords({
                              ...passwords,
                              newPassword: e.target.value,
                            })
                          }
                          className="pl-10 w-full p-1.5 border text-[14px] border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent bg-gray-50/50"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              new: !showPasswords.new,
                            })
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.new ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {passwordErrors.newPassword}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <label className="text-sm font-medium text-gray-700 block mb-2 text-left pl-4">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwords.confirmPassword}
                          onChange={(e) =>
                            setPasswords({
                              ...passwords,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="pl-10 w-full p-1.5 border text-[14px] border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent bg-gray-50/50"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              confirm: !showPasswords.confirm,
                            })
                          }
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">
                          {passwordErrors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 flex justify-end">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="flex flex-row items-center justify-around px-2 py-0 text-white font-medium  h-[30px] w-[140px] bg-primary-light hover:bg-hover-light transition-all duration-200 my-2 rounded-[4px] text-[13px]"
                      >
                        {loading ? "Updating Password..." : "Change Password"}
                      </motion.button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-[18px] font-semibold text-gray-800 flex items-center">
                    <Shield className="h-5 w-5 text-green-600 mr-2" />
                    Security Status
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between text-left">
                      <div>
                        <p className="font-medium text-[14px] text-gray-700">
                          Password Strength
                        </p>
                        <p className=" text-gray-500 text-[13px]">
                          How secure is your password
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full text-xs font-medium">
                        Medium
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700 text-[14px] text-left">
                          Two-Factor Auth
                        </p>
                        <p className=" text-gray-500 text-[13px] text-left">
                          Extra security layer
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                        Disabled
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700 text-[14px]">
                          Last Password Change
                        </p>
                        <p className=" text-gray-500  text-left text-[13px]">
                          Last update
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        Never
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-row gap-2 items-center">
                <Bell className="h-5 w-5 text-green-600 mr-2" />

                <div className="flex flex-col text-left">
                  <h2 className="text-[18px] font-semibold text-gray-800 flex items-center">
                    Notification Preferences
                  </h2>
                  <p className="text-gray-500 text-sm ">
                    Manage how you receive notifications
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {[
                  {
                    title: "Disaster Alerts",
                    description:
                      "Get notified about new disasters in your area",
                    enabled: true,
                  },
                  {
                    title: "Community Updates",
                    description:
                      "Updates from community members and organizations",
                    enabled: true,
                  },
                  {
                    title: "Resource Alerts",
                    description: "Get notified about new resources and support",
                    enabled: false,
                  },
                  {
                    title: "Volunteer Opportunities",
                    description: "Notifications about ways to help",
                    enabled: false,
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center text-left justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-gray-800">{item.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked={item.enabled}
                        className="sr-only peer outline-none ring-0 focus:ring-0"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-0 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Saved Tab */}
        {activeTab === "saved" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-row gap-2 items-center">
                <Bookmark className="h-5 w-5 text-green-600 mr-2" />

                <div className="flex flex-col text-left">
                  <h2 className="text-[18px] font-semibold text-gray-800 flex items-center">
                    Saved Items
                  </h2>
                  <p className="text-gray-500 text-sm ">
                    View and manage your saved resources
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bookmark className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700">
                  No saved items yet
                </h3>
                <p className="text-gray-500 mt-2 max-w-md mx-auto text-[14px]">
                  When you save posts, resources, or alerts, they'll appear here
                  for easy access.
                </p>
                <button className="mt-4 px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                  Browse Resources
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
