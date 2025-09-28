import logo from "../assets/logo.png";
import React, { useState, useRef } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import useStore from "../store/useStore";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const backend_url = useStore((state) => state.backend_url);
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [isEmail, setIsEmail] = useState(true);
  const [countryCode, setCountryCode] = useState("+91");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [toast, setToast] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef(null);

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setOtpSent(false);
    setToast({ message: "", type: "" });
    clearInterval(intervalRef.current);
  };

  const toggleMethod = (method) => setIsEmail(method === "email");
  const togglePassword = () => setShowPassword(!showPassword);

  const getWebDeviceDetails = () => {
    let deviceId = localStorage.getItem("device_id");
    if (!deviceId) {
      deviceId = uuidv4();
      localStorage.setItem("device_id", deviceId);
    }
    const ua = navigator.userAgent;
    let deviceType = "DESKTOP";
    if (/Tablet|iPad/i.test(ua)) deviceType = "TABLET";
    else if (/Mobi|Android/i.test(ua)) deviceType = "MOBILE";
    return { deviceId, deviceType };
  };

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 5000);
  };

  const parseDuration = (duration) => {
    if (!duration) return 180;
    const clean = duration.replace(/[^\d:]/g, "");
    const [mins, secs] = clean.split(":").map(Number);
    return mins * 60 + (secs || 0);
  };

  const startTimer = (durationInSeconds) => {
    setTimer(durationInSeconds);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTimer = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const storeUserAndTokens = (user, jwt_token, refresh_token) => {
  // Update localStorage
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("auth_token", jwt_token);
  if (refresh_token) localStorage.setItem("refresh_token", refresh_token);

  // Update Zustand store
  useStore.getState().setAuth(user, jwt_token, refresh_token);
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { deviceId, deviceType } = getWebDeviceDetails();
    const auth_type = isEmail ? "email" : "mobile";

    const payload = {
      auth_type,
      device_id: deviceId,
      device_type: deviceType,
      password,
      action: isLogin ? "sign_in" : "sign_up",
    };

    if (isEmail) payload.email = email;
    else payload.mobile = countryCode + mobile;

    try {
      const res = await fetch(`${backend_url}/auth/authenticate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log("Response:", data);

      if (data.success) {
        if (!isLogin && isEmail) {
          showToast(data.message || "OTP sent successfully", "success");
          setOtpSent(true);
          const durationInSeconds = parseDuration(data.duration);
          startTimer(durationInSeconds);
        } else {
          storeUserAndTokens(data.user, data.jwt_token, data.refresh_token);
          showToast("Login successful!", "success");
          navigate("/");
        }
      } else {
        showToast(data.message || "Error occurred", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Something went wrong. Try again!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { deviceId, deviceType } = getWebDeviceDetails();

    const payload = {
      auth_type: "email",
      email,
      otp,
      device_id: deviceId,
      device_type: deviceType,
    };

    try {
      const res = await fetch(`${backend_url}/auth/authenticate-pass`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      console.log("OTP Response:", data);

      if (data.success) {
        storeUserAndTokens(data.user, data.jwt_token, data.refresh_token);
        showToast("Sign Up successful!", "success");
        setOtpSent(false);
        setIsLogin(true);
        clearInterval(intervalRef.current);
        navigate("/");
      } else {
        showToast(data.message || "OTP verification failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Something went wrong. Try again!", "error");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!email) return showToast("Please enter your email", "error");
    setLoading(true);

    try {
      const res = await fetch(`${backend_url}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auth_type: "email", email }),
      });
      const data = await res.json();
      console.log("Resend OTP Response:", data);

      if (data.success) {
        showToast(data.message || "OTP resent successfully", "success");
        const durationInSeconds = parseDuration(data.duration);
        startTimer(durationInSeconds);
      } else {
        showToast(data.message || "Failed to resend OTP", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Something went wrong. Try again!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen relative">
      {/* Left half */}
      <div className="md:w-1/2 flex flex-col md:flex-row items-center justify-center bg-gray-100 p-6">
        <img src={logo} alt="Logo" className="w-24 md:w-32 mb-4 md:mb-0 md:mr-4" />
        <div className="flex flex-col items-center md:items-start">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">E - com</h1>
          <h2 className="text-xl md:text-2xl text-gray-600">Platform</h2>
        </div>
      </div>

      {/* Right half: Form */}
      <div className="md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-lg md:max-w-xl p-8 md:p-12 border rounded-lg shadow-md bg-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            {isLogin ? "Login" : "Sign Up"}
          </h2>

          {!otpSent && (
            <>
              {/* Toggle Email / Mobile */}
              <div className="flex justify-center mb-6">
                <button
                  type="button"
                  onClick={() => toggleMethod("email")}
                  className={`px-4 py-2 rounded-l border ${
                    isEmail ? "bg-orange-600 text-white" : "bg-white text-gray-700"
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => toggleMethod("mobile")}
                  className={`px-4 py-2 rounded-r border ${
                    !isEmail ? "bg-orange-600 text-white" : "bg-white text-gray-700"
                  }`}
                >
                  Mobile
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                {isEmail ? (
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 border rounded text-base"
                      required
                    />
                  </div>
                ) : (
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Mobile Number</label>
                    <div className="flex">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="p-3 border rounded-l text-base bg-white"
                      >
                        <option value="+91">+91 (IN)</option>
                        <option value="+1">+1 (US)</option>
                        <option value="+44">+44 (UK)</option>
                        <option value="+61">+61 (AU)</option>
                      </select>
                      <input
                        type="tel"
                        placeholder="98765 43210"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full p-3 border-t border-b border-r rounded-r text-base"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Password Field */}
                <div className="mb-6 relative">
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 border rounded text-base pr-10"
                    required
                  />
                  <span
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                    onClick={togglePassword}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-600 text-white p-3 rounded hover:bg-orange-700 text-lg disabled:opacity-50 flex justify-center items-center gap-2"
                  disabled={loading}
                >
                  {loading && (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                      ></path>
                    </svg>
                  )}
                  {isLogin ? "Login" : "Sign Up"}
                </button>
              </form>
            </>
          )}

          {otpSent && (
            <form onSubmit={handleOtpSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Enter OTP sent to your email
                </label>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-3 border rounded text-base"
                  required
                />
              </div>
              <div className="flex justify-between items-center mb-4">
                {timer > 0 ? (
                  <span className="text-gray-600">Resend OTP in {formatTimer(timer)}</span>
                ) : (
                  <button
                    type="button"
                    className="text-orange-600 underline"
                    onClick={resendOtp}
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-orange-600 text-white p-3 rounded hover:bg-orange-700 text-lg disabled:opacity-50 flex justify-center items-center gap-2"
                disabled={loading}
              >
                {loading && (
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                    ></path>
                  </svg>
                )}
                Verify OTP
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span className="text-orange-600 cursor-pointer underline" onClick={toggleForm}>
              {isLogin ? "Sign Up" : "Login"}
            </span>
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.message && (
        <div
          className={`fixed bottom-4 right-4 px-4 py-3 rounded shadow-lg text-white animate-slide-in ${
            toast.type === "success"
              ? "bg-green-600"
              : toast.type === "error"
              ? "bg-red-600"
              : "bg-blue-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Toast animation */}
      <style>
        {`
          @keyframes slide-in {
            0% { transform: translateX(100%); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
          }
          .animate-slide-in {
            animation: slide-in 0.5s ease forwards;
          }
        `}
      </style>
    </div>
  );
}
