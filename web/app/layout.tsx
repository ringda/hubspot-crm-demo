import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Retail GTM Launch Workflow - HubSpot Demo",
  description:
    "HubSpot stores partner facts; a launch tracker stores product facts; the skill preserves GTM launch judgment with risk, owner, next action, and human checkpoint.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
