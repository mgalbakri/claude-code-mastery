import type { Metadata } from "next";
import PaymentSuccessClient from "./success-client";

export const metadata: Metadata = {
  title: "Payment Confirmation",
  robots: { index: false, follow: false },
};

export default function PaymentSuccessPage() {
  return <PaymentSuccessClient />;
}
