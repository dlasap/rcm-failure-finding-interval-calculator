import RCMDecisionTool from "../components/RCMDecisionTool";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>RCM Decision Tool | Reliability Management Ltd.</title>
        <meta name="description" content="RCM Decision Tool helps you make the best decisions for your business. Discover the benefits today!" />
        <meta name="keywords" content="RCM, Decision Tool, Business Optimization, Analytics" />
        <meta name="author" content="Reliability Management Ltd." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://reliabilitymanagement.co.uk/" />
      </Head>
      <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-8">
        <RCMDecisionTool />
      </main>
    </>
  );
}
