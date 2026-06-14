"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, CalendarCheck, Loader2, Mail, ShieldCheck } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { publicEnv } from "@/lib/env";

type FormStatus = "idle" | "loading" | "sent" | "error";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const errorParam = searchParams?.get("error");
    if (errorParam) {
      setStatus("error");
      if (
        errorParam === "pkce_code_verifier_not_found" ||
        errorParam === "flow_state_not_found"
      ) {
        setMessage(
          "Security error: Please open the login link on the exact same device and browser you used to request it."
        );
      } else {
        setMessage("Login failed or link expired. Please try again.");
      }
    }
  }, [searchParams]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const supabase = createSupabaseBrowserClient();
    const appUrl = publicEnv.appUrl.replace(/\/$/, "");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${appUrl}/auth/callback`,
        shouldCreateUser: true,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("sent");
    setMessage("Check your email for the BookZy login link.");
  }

  const isLoading = status === "loading";

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

          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950">
              Sign in to manage your bookings
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Enter your professional email address. We&apos;ll send a secure login
              link, no password needed.
            </p>
          </div>

          <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
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

            <div className="flex gap-4">
              <button
                className="flex flex-1 h-14 items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 text-base font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>Send link <ArrowRight className="h-5 w-5" /></>
                )}
              </button>
              
            </div>

            {message ? (
              <p
                className={
                  status === "error"
                    ? "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    : "rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                }
              >
                {message}
              </p>
            ) : null}

            <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
              <ShieldCheck className="h-4 w-4" />
              No password needed
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
