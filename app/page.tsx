"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LegalDisclaimer } from "@/components/LegalDisclaimer";
import Head from "next/head";

export default function Home() {
  return (
    <div className="space-y-6">
      <Head>
        <title>RCM Failure Finding Interval Calculator | Reliability Management Ltd.</title>
        <meta name="description" content="RCM Decision Tool helps you make the best decisions for your business. Discover the benefits today!" />
        <meta name="keywords" content="RCM, Decision Tool, Business Optimization, Analytics" />
        <meta name="author" content="Reliability Management Ltd." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://reliabilitymanagement.co.uk/" />
      </Head>
      <h1 className="text-3xl font-bold">Failure Finding Interval Calculator</h1>
      <p className="text-lg">
        Welcome to the Failure Finding Interval (FFI) Calculator. This tool helps you determine appropriate intervals for detecting hidden failures of
        protective devices through Failure Finding. It uses standard mathematical formulae to calculate the failure finding interval using the
        required inputs for each formula.
      </p>
      <div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="link" className="p-0 text-primary hover:underline">
              What is Failure Finding?
              <Info className="ml-2 h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>About Failure Finding</DialogTitle>
              <DialogDescription>
                Failure finding involves checking a protective device to determine whether it has failed, and fixing it if necessary. The principle is
                that the more frequently the protective device is checked, the more quickly the failure is detected, the greater the availability of
                the protective device and the lower the probability of the multiple failure. Ideally, failure finding should check the protective
                device as a whole.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
      <Alert variant="default" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Economic Optimum FFI, Risk Based FFI, and Risk Based Voting FFI calculators are available for paying subscribers.
        </AlertDescription>
      </Alert>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Availability-based FFI</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-grow">
            <p className="mb-4 flex-grow">Calculate FFI based on target availability and MTBF of the protective device.</p>
            <Button asChild className="w-full mt-auto">
              <Link href="/calculator/availability-based-ffi">Start Calculation</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="flex flex-col opacity-50">
          <CardHeader>
            <CardTitle>Economic Optimum FFI</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-grow">
            <p className="mb-4 flex-grow">
              Calculate FFI based on the cost of the multiple failure, the cost of doing the task, the probability the protective device will fail,
              and the probability it will be needed.
            </p>
            <Button disabled className="w-full mt-auto">
              Available for paying Subscribers (Coming soon)
            </Button>
          </CardContent>
        </Card>
        <Card className="flex flex-col opacity-50">
          <CardHeader>
            <CardTitle>Risk Based FFI</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-grow">
            <p className="mb-4 flex-grow">
              Calculate FFI based on the MTBF of the protective device, the rate of demand on the protective device, and the tolerable period between
              occurrences of the multiple failure.
            </p>
            <Button disabled className="w-full mt-auto">
              Available for paying Subscribers (Coming soon)
            </Button>
          </CardContent>
        </Card>
        <Card className="flex flex-col opacity-50">
          <CardHeader>
            <CardTitle>Risk Based Voting FFI</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col flex-grow">
            <p className="mb-4 flex-grow">
              Calculate FFI based on the MTBF of the protective device, the rate of demand on the protective device, the tolerable period between
              occurrences of the multiple failure and the voting configuration
            </p>
            <Button disabled className="w-full mt-auto">
              Available for paying Subscribers (Coming soon)
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-center mt-8">
        <Button asChild variant="outline" className="w-full max-w-md">
          <a href="https://reliabilitymanagement.co.uk/contact-us/" target="_blank" rel="noopener noreferrer">
            Contact Reliability Management
          </a>
        </Button>
      </div>
      <LegalDisclaimer />
    </div>
  );
}
