"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CalendarCheck, Loader2, Mail, ShieldCheck, KeyRound, RotateCcw } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Step = "email" | "code";

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const codeInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus code input when step changes to "code"
  useEffect(() => {
    if (step === "code") {
      // Small delay so DOM has rendered
      setTimeout(() => codeInputRef.current?.focus(), 50);
    }
  }, [step]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const sendOtp = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccessMsg("");

    const supabase = createSupabaseBrowserClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    setLoading(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }

    setStep("code");
    setSuccessMsg(`Code sent to ${email}`);
    setResendCooldown(30);
  }, [email]);

  async function handleSendCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendOtp();
  }

  async function handleVerifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createSupabaseBrowserClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: "email",
    });

    if (verifyError) {
      setLoading(false);
      setError(verifyError.message);
      return;
    }

    // Session is now set in the browser. Check where to redirect.
    try {
      const res = await fetch("/api/auth/check-business");
      const { hasBusiness } = await res.json();
      router.push(hasBusiness ? "/dashboard" : "/onboarding");
    } catch {
      // Fallback if the API call fails — session exists so onboarding is safe
      router.push("/onboarding");
    }
  }

  async function handleResend() {
    setOtpCode("");
    setError("");
    await sendOtp();
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="hidden bg-[linear-gradient(180deg,#eef7ff_0%,#f8fbff_45%,#dcecf6_100%)] p-10 lg:flex lg:items-center lg:justify-center">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white/85 p-10 text-center shadow-xl shadow-slate-200/70 backdrop-blur">
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-700 text-white">
            <CalendarCheck className="h-7 w-7" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950">
            Premium Management
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Streamline your appointment workflow with calm, reliable booking tools.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-16 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <span className="text-4xl font-black tracking-tight text-slate-950">
              BookZy
            </span>
          </div>

          {step === "email" ? (
            <>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-950">
                  Sign in to manage your bookings
                </h1>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  Enter your professional email address. We&apos;ll send a secure
                  6-digit code, no password needed.
                </p>
              </div>

              <form className="mt-10 space-y-6" onSubmit={handleSendCode}>
                <div>
                  <label
                    className="text-sm font-semibold text-slate-900"
                    htmlFor="email"
                  >
                    Email address
                  </label>
                  <div className="relative mt-2">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      className="h-14 w-full rounded-lg border border-slate-300 bg-white pl-12 pr-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
                      id="email"
                      name="email"
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="name@business.com"
                      type="email"
                      value={email}
                    />
                  </div>
                </div>

                <button
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 text-base font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>Send code <ArrowRight className="h-5 w-5" /></>
                  )}
                </button>

                {error && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
                  <ShieldCheck className="h-4 w-4" />
                  No password needed
                </div>
              </form>
            </>
          ) : (
            <>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-slate-950">
                  Enter your code
                </h1>
                <p className="mt-4 text-base leading-7 text-slate-600">
                  We sent a 6-digit code to{" "}
                  <span className="font-semibold text-slate-900">{email}</span>.
                  Check your inbox and enter it below.
                </p>
              </div>

              <form className="mt-10 space-y-6" onSubmit={handleVerifyCode}>
                <div>
                  <label
                    className="text-sm font-semibold text-slate-900"
                    htmlFor="otp-code"
                  >
                    6-digit code
                  </label>
                  <div className="relative mt-2">
                    <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      ref={codeInputRef}
                      className="h-14 w-full rounded-lg border border-slate-300 bg-white pl-12 pr-4 text-center text-2xl font-bold tracking-[0.4em] text-slate-950 outline-none transition placeholder:text-base placeholder:font-normal placeholder:tracking-normal focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
                      id="otp-code"
                      inputMode="numeric"
                      maxLength={6}
                      name="otp-code"
                      onChange={(event) =>
                        setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="Enter code"
                      value={otpCode}
                    />
                  </div>
                </div>

                <button
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 text-base font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={loading || otpCode.length < 6}
                  type="submit"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>Verify <ArrowRight className="h-5 w-5" /></>
                  )}
                </button>

                {error && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </p>
                )}

                {successMsg && !error && (
                  <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {successMsg}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <button
                    className="flex items-center gap-1.5 text-sm font-medium text-blue-700 transition hover:text-blue-900 disabled:cursor-not-allowed disabled:text-slate-400"
                    disabled={resendCooldown > 0 || loading}
                    onClick={handleResend}
                    type="button"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend code"}
                  </button>

                  <button
                    className="text-sm font-medium text-slate-500 transition hover:text-slate-700"
                    onClick={() => {
                      setStep("email");
                      setOtpCode("");
                      setError("");
                      setSuccessMsg("");
                    }}
                    type="button"
                  >
                    Use a different email
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
