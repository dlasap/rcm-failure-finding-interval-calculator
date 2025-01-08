"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, ArrowLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { UserLoginDialog } from "@/components/UserLoginDIalog";
import { useUser } from "@/lib/user-context";

const isPaidUser = (plans: string[]) => {
  let isPaid = false;
  plans.forEach((plan) => {
    if (plan?.toLowerCase().includes("bronze") || plan?.toLowerCase().includes("silver") || plan?.toLowerCase().includes("gold")) {
      isPaid = true;
    }
  });
  return isPaid;
};

export default function Home() {
  const { userPlans, user } = useUser();

  const isValidPlanUser = useMemo(() => {
    return !!userPlans && !!user && isPaidUser(userPlans ? userPlans?.map((plan) => plan?.name) : []);
  }, [userPlans, user]);

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <Button variant="outline" size="icon" asChild>
            <a href="https://reliabilitymanagement.co.uk" target="_blank" rel="noopener noreferrer">
              <ArrowLeft className="h-4 w-4" />
            </a>
          </Button>
          <h1 className="text-3xl font-bold">Failure Finding Interval Calculator</h1>
          <UserLoginDialog />
        </div>
        <p className="text-lg">
          Welcome to the Failure Finding Interval (FFI) Calculator. This tool helps you determine appropriate intervals for detecting hidden failures
          of protective devices through Failure Finding. It uses standard mathematical formulae to calculate the failure finding interval using the
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
                  Failure finding involves checking a protective device to determine whether it has failed, and fixing it if necessary. The principle
                  is that the more frequently the protective device is checked, the more quickly the failure is detected, the greater the availability
                  of the protective device and the lower the probability of the multiple failure. Ideally, failure finding should check the protective
                  device as a whole.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
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
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Economic Optimum FFI</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <p className="mb-4 flex-grow">
                Calculate FFI based on the cost of the multiple failure, the cost of doing the task, the probability the protective device will fail,
                and the probability it will be needed.
              </p>
              <Button className="w-full mt-auto" disabled={!isValidPlanUser}>
                {isValidPlanUser ? <Link href="/calculator/economic-optimum-ffi">Start Calculation</Link> : "Upgrade Plan to Unlock"}
              </Button>
            </CardContent>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Risk Based FFI</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <p className="mb-4 flex-grow">
                Calculate FFI based on the MTBF of the protective device, the rate of demand on the protective device, and the tolerable period
                between occurrences of the multiple failure.
              </p>
              <Button className="w-full mt-auto" disabled={!isValidPlanUser}>
                {isValidPlanUser ? <Link href="/calculator/risk-based-ffi">Start Calculation</Link> : "Upgrade Plan to Unlock"}
              </Button>
            </CardContent>
          </Card>
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Risk Based Voting FFI</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              <p className="mb-4 flex-grow">
                Calculate FFI based on the MTBF of the protective device, the rate of demand on the protective device, the tolerable period between
                occurrences of the multiple failure and the voting configuration
              </p>
              <Button className="w-full mt-auto" disabled={!isValidPlanUser}>
                {isValidPlanUser ? <Link href="/calculator/risk-based-voting-ffi">Start Calculation</Link> : "Upgrade Plan to Unlock"}
              </Button>
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-center mt-8">
          <Button asChild variant="outline" size="lg" className="w-full max-w-md">
            <a href="https://reliabilitymanagement.co.uk" target="_blank" rel="noopener noreferrer">
              Visit Reliability Management
            </a>
          </Button>
        </div>
      </div>
    </>
  );
}
