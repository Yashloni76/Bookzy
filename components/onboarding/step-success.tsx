"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";
import { publicEnv } from "@/lib/env";

export function StepSuccess({ businessSlug }: { businessSlug: string }) {
  const [copied, setCopied] = useState(false);
  const link = `${publicEnv.appUrl}/${businessSlug}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="text-center py-8">
      <CardHeader>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <CardTitle className="text-3xl">You&apos;re all set!</CardTitle>
        <CardDescription className="text-lg mt-2">
          Your booking page is live. Share this link with your customers to start receiving bookings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <span className="text-slate-900 dark:text-slate-50 font-medium truncate flex-1 text-left">
            {link}
          </span>
          <Button variant="secondary" onClick={copyToClipboard} className="shrink-0 gap-2 w-24">
            {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>

        <div className="flex gap-4">
          <Link href={`/${businessSlug}`} target="_blank" className="flex-1">
            <Button variant="secondary" className="w-full gap-2">
              <ExternalLink className="h-4 w-4" /> Preview Page
            </Button>
          </Link>
          <Link href="/dashboard" className="flex-1">
            <Button className="w-full">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
