import type { Metadata } from "next";
import "./globals.css";
import { buildMetadata } from "./seo";

export const metadata: Metadata = buildMetadata({
  title: "Wayfarer's Archive | Offline Knowledge Drive Project",
  description:
    "Follow Wayfarer's Archive as it validates a free builder for an offline Wikipedia drive and measures a possible small batch of prepared field editions.",
  path: "/",
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
