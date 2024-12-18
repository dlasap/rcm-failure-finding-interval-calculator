"use client";

import { useAddToHomescreenPrompt } from "@/hooks/useAddToHomeScreenHook";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [prompt, promptToInstall] = useAddToHomescreenPrompt();
  const [isVisible, setVisibleState] = useState(false);

  const hide = () => setVisibleState(false);

  useEffect(() => {
    if (prompt) {
      setVisibleState(true);
    }
  }, [prompt]);

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto py-4 px-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Image src="/android-chrome-192x192.png" alt="Reliability Management Ltd" width={70} height={70} className="inline-block ml-2" />{" "}
            <Link href="/" className="text-xl font-bold">
              Failure Finding Interval Calculator V1.0
            </Link>
            {isVisible && (
              <div onClick={hide}>
                <button onClick={hide}>Close</button>
                Hello! Wanna add to homescreen?
                <button onClick={promptToInstall}>Add to homescreen</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
