import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { rgApi } from "../../api/rgApi";

export default function OtpLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState("mobile");
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isValidMobileNumber = (number) => {
    return /^\+\d{10,15}$/.test(number);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!isValidMobileNumber(mobileNumber)) {
      setError("Please enter a valid mobile number (e.g., +254712345678)");
      setLoading(false);
      return;
    }

    try {
      const response = await rgApi.sendOtp(mobileNumber);

      if (response.data.success) {
        setStep("otp");
        setSuccess("OTP has been sent to your mobile number");

        if (response.data.otp && import.meta.env.VITE_ENV === "development") {
          console.log("Development OTP:", response.data.otp);
          setSuccess(`OTP sent! (Dev: ${response.data.otp})`);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send OTP. Please try again."
      );
      console.error("Send OTP error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP");
      setLoading(false);
      return;
    }

    try {
      const response = await rgApi.verifyOtp(mobileNumber, otp);

      if (response.data.success) {
        login(
          response.data.token,
          response.data.customer,
          response.data.config || {}
        );

        navigate("/set-limits");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
      console.error("Verify OTP error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep("mobile");
    setOtp("");
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Responsible Gaming
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Take control of your gambling habits
          </p>
        </div>

        <div className="card">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
            {step === "mobile" ? "Sign In" : "Enter OTP"}
          </h2>

          {success && (
            <div className="alert-success mb-4">
              <p className="text-sm">{success}</p>
            </div>
          )}

          {error && (
            <div className="alert-error mb-4">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {step === "mobile" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label
                  htmlFor="mobile"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Mobile Number
                </label>
                <input
                  id="mobile"
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+254712345678"
                  className="input"
                  required
                  disabled={loading}
                  autoComplete="tel"
                  autoFocus
                />
                <p className="mt-2 text-xs text-gray-500">
                  Enter your mobile number with country code
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="spinner w-5 h-5 border-2 mr-2"></span>
                    Sending OTP...
                  </span>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Enter OTP
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  We sent a 6-digit code to <strong>{mobileNumber}</strong>
                </p>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="123456"
                  maxLength="6"
                  className="input text-center text-2xl tracking-widest"
                  required
                  disabled={loading}
                  autoComplete="one-time-code"
                  autoFocus
                  inputMode="numeric"
                  pattern="\d{6}"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Enter the 6-digit code sent to your phone
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="btn-primary w-full"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="spinner w-5 h-5 border-2 mr-2"></span>
                    Verifying...
                  </span>
                ) : (
                  "Verify OTP"
                )}
              </button>

              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="btn-secondary w-full"
              >
                Change Mobile Number
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to set responsible gaming limits to protect
            yourself
          </p>
        </div>
      </div>
    </div>
  );
}
