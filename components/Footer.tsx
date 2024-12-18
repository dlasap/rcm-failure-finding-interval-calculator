import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-4">
      <div className="container mx-auto px-4 text-center">
        <Image src="/android-chrome-192x192.png" alt="Reliability Management Ltd" width={70} height={70} className="inline-block ml-2" />{" "}
        <p className="pt-4">&copy; 2023 Reliability Management Ltd. All rights reserved.</p>
      </div>
    </footer>
  );
}
