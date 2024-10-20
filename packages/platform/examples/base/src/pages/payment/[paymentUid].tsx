import { Navbar } from "@/components/Navbar";
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";

import { PaymentForm } from "@calcom/atoms";

const inter = Inter({ subsets: ["latin"] });

export default function Payment(props: { calUsername: string; calEmail: string }) {
  const pathname = usePathname();

  const uid = pathname.split("/").pop();

  return (
    <main className={`flex min-h-screen flex-col ${inter.className}`}>
      <Navbar username={props.calUsername} />
      <PaymentForm paymentUid={uid ?? ""} />
    </main>
  );
}
