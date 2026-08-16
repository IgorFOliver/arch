"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { LoginForm } from "@ui/molecules/LoginForm/LoginForm";

import { loginSchema, LoginFormValues } from "@/features/auth/schema";
import { useLogin } from "@/features/auth/use-login";
import { auth0LoginUrl } from "@/features/auth/api";

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const loginMutation = useLogin();

  const onSubmit = handleSubmit((values) => loginMutation.mutate(values));

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-50 px-4 py-16">
      <LoginForm
        emailInputProps={register("email")}
        passwordInputProps={register("password")}
        emailError={errors.email?.message}
        passwordError={errors.password?.message}
        error={loginMutation.isError ? loginMutation.error.message : undefined}
        isLoading={loginMutation.isPending}
        onSubmit={onSubmit}
      />
      <a
        href={auth0LoginUrl()}
        className="w-full max-w-md text-center text-sm text-gray-600 underline underline-offset-2 hover:text-gray-900"
      >
        Entrar com Auth0
      </a>
    </div>
  );
}
