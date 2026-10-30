"use client";

import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { UserForm, userSchema } from "@/schemas/auth.schema";
import { authService } from "@/services/auth.service";
import Link from "next/link";
import { useState } from "react";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  photoUrl: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: emptyForm,
  });

  const onSubmit = async (data: UserForm) => {
    try {
      await authService.register(data);
      toast.success("Account created successfully.");
      router.push("/login");
    } catch (error) {
      toast.error("Email already exists.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header */}

        <div className="bg-gradient-to-r from-indigo-900 to-blue-500 px-8 py-8">
          <h1 className="text-3xl font-bold text-white">Create Account</h1>

          <p className="text-blue-100 mt-2">
            Register to access the PulsePath platform.
          </p>
        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-8 grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {/* First Name */}

          <div>
            <label htmlFor="firstname" className="block text-sm font-medium mb-2 text-gray-700">
              First Name
            </label>

            <input
              {...register("firstName")}
              id="firstname"
              className={`w-full rounded-xl border px-4 py-3 transition
                ${
                  errors.firstName
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }
                focus:outline-none focus:ring-2`}
            />

            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last Name */}

          <div>
            <label htmlFor="lastname" className="block text-sm font-medium mb-2 text-gray-700">
              Last Name
            </label>

            <input
              {...register("lastName")}
              id="lastname"
              className={`w-full rounded-xl border px-4 py-3 transition
                ${
                  errors.lastName
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }
                focus:outline-none focus:ring-2`}
            />

            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Email */}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700">
              Email
            </label>

            <input
              type="email"
              {...register("email")}
              id="email"
              className={`w-full rounded-xl border px-4 py-3 transition
                ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }
                focus:outline-none focus:ring-2`}
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-2 text-gray-700">
              Phone
            </label>

            <input
              {...register("phone")}
              id="phone"
              className={`w-full rounded-xl border px-4 py-3 transition
                ${
                  errors.phone
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }
                focus:outline-none focus:ring-2`}
            />

            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Password */}

          <div className="md:col-span-2">
            <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                id="password"
                className={`w-full rounded-xl border px-4 py-3 transition
                ${
                  errors.password
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }
                focus:outline-none focus:ring-2`}
              />

              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
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
          </div>
          <div className="text-left text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Sign in
            </Link>
          </div>

          {/* Submit */}
          <div className="md:col-span-2 flex justify-end mt-3">
            <button
              type="submit"
              aria-label={`${isSubmitting ? "Creating Account...." : "Create Account"}`}
              disabled={isSubmitting}
              className="
                px-8
                py-3
                cursor-pointer
                rounded-xl
                text-white
                font-semibold
                bg-gradient-to-r
                from-indigo-900
                to-blue-500
                hover:shadow-lg
                hover:scale-[1.03]
                transition-all
                disabled:opacity-50
              "
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
