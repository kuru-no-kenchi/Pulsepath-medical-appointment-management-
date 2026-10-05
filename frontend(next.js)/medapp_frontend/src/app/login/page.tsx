"use client";
import { authService } from "@/services/auth.service";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await authService.login({
        email,
        password,
      });

      login(response.token, response.role);

      router.push(`/loading?role=${response.role}`);
    } catch (error) {
      console.error(error);
      toast.error("Invalid email or password");
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-900 via-blue-700 to-blue-500 text-white p-16 flex-col justify-center">
        <div className="max-w-xl">
          <img src="/logo.png" alt="MedApp" className="w-16 h-16 mb-4" />
          <h1 className="text-5xl font-bold mb-6">Welcome Back</h1>

          <p className="text-blue-100 text-lg leading-8">
            Access your medical dashboard, manage appointments, patients,
            doctors and assistants from one secure place.
          </p>

          <div className="mt-16 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                👨‍⚕️
              </div>

              <div>
                <p className="font-semibold">Doctor Management</p>

                <p className="text-blue-100 text-sm">
                  Easily organize your medical staff.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                📅
              </div>

              <div>
                <p className="font-semibold">Appointment Scheduling</p>

                <p className="text-blue-100 text-sm">
                  Keep your consultations organized.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                🔒
              </div>

              <div>
                <p className="font-semibold">Secure Authentication</p>

                <p className="text-blue-100 text-sm">
                  Your data is protected at every step.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}

      <div className="flex w-full lg:w-[500px] items-center justify-center p-8">
        <div className="w-full bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Login</h2>

            <p className="text-gray-500 mt-2">Sign in to continue to MedApp.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>

              <input
                type="email"
                id="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative mb-5">
                <input
                id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  aria-label="Show Password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <FiEyeOff aria-hidden="true" />
                  ) : (
                    <FiEye aria-hidden="true" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    aria-label="Remember me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  Remember me
                </label>

                <Link
                  href="/reset-password"
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              aria-label={`${loading ? "Signing in..." : "Login"}`}
              disabled={loading}
              className="w-full py-3 cursor-pointer rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-900 to-blue-500 hover:shadow-lg hover:scale-[1.03] transition-all"
            >
              {loading ? "Signing in....." : "Login"}
            </button>

            <div className="text-center text-sm text-gray-500 pt-2">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
