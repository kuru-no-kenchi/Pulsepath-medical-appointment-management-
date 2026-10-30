"use client";
import { authService } from "@/services/auth.service";
import { FiActivity, FiEye, FiEyeOff } from "react-icons/fi";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  type ResetPasswordForm,
} from "@/schemas/auth.schema";

const defaultValues = {
  email: "",
  password: "",
};

export default function ResetPasswordPage() {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues,
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    if (data.password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({
        email: data.email,
        newPassword: data.password,
      });

      toast.success("Password reset successfully");
      router.push("/login");
    } catch (error: unknown) {
      console.error(error);
      toast.error("Unable to reset your password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-900 via-blue-700 to-blue-500 text-white p-16 flex-col justify-center">
        <div className="max-w-xl">
          <div className="mb-12 inline-flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-cyan-200">
              <FiActivity size={26} />
            </span>
            <span className="text-2xl font-bold tracking-tight">
              PulsePath
            </span>
          </div>
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

      <div className="flex w-full lg:w-[500px] items-center justify-center p-8">
        <div className="w-full bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8">
          <div className="mb-8">
            <div className="mb-8 inline-flex items-center gap-3 lg:hidden">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-900 to-blue-500 text-white shadow-sm">
                <FiActivity size={23} />
              </span>
              <span className="text-xl font-bold tracking-tight text-indigo-950">
                PulsePath
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>

            <p className="text-gray-500 mt-2">
              Set a new password for your PulsePath account.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>

              <input
                type="email"
                placeholder="example@email.com"
                {...register("email")}
                className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative mb-3">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={`w-full rounded-xl border px-4 py-3 focus:ring-2 focus:outline-none ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  }`}
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
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  aria-label="Show Password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <FiEyeOff aria-hidden="true" />
                  ) : (
                    <FiEye aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              aria-label={`${loading || isSubmitting ? "Resetting..." : "Reset Password"}`}
              disabled={loading || isSubmitting}
              className="w-full py-3 cursor-pointer rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-900 to-blue-500 hover:shadow-lg hover:scale-[1.03] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading || isSubmitting ? "Resetting..." : "Reset Password"}
            </button>

            <div className="text-center text-sm text-gray-500 pt-2">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
