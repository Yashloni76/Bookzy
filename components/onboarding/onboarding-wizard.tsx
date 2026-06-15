"use client";

import { useState } from "react";
import { StepBusinessProfile } from "./step-business-profile";
import { StepServices } from "./step-services";
import { StepWorkingHours } from "./step-working-hours";
import { StepSuccess } from "./step-success";

export type OnboardingData = {
  businessId: string | null;
  businessSlug: string | null;
};

export function OnboardingWizard({
  initialStep = 1,
  initialData = { businessId: null, businessSlug: null }
}: {
  initialStep?: number,
  initialData?: OnboardingData
}) {
  const [step, setStep] = useState(initialStep);
  const [data, setData] = useState<OnboardingData>(initialData);

  const nextStep = () => setStep((s) => s + 1);

  const updateData = (newData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900/50 items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-950 dark:text-slate-50">
            Set up your business
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Step {step} of 4
          </p>
          <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="bg-blue-700 transition-all duration-500"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <StepBusinessProfile onNext={nextStep} onUpdate={updateData} />
        )}
        {step === 2 && (
          <StepServices businessId={data.businessId!} onNext={nextStep} />
        )}
        {step === 3 && (
          <StepWorkingHours businessId={data.businessId!} onNext={nextStep} />
        )}
        {step === 4 && (
          <StepSuccess businessSlug={data.businessSlug!} />
        )}
      </div>
    </div>
  );
}
