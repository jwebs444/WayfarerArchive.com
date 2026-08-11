import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og-wayfarer.png`;
  const title = "Wayfarer's Archive";
  const description = "Build a verified offline Wikipedia drive for free, or join a small founding batch for a finished Wayfarer's Archive field edition.";
  return {
    title,
    description,
    metadataBase: new URL(`${protocol}://${host}`),
    alternates: { canonical: "/" },
    openGraph: { title, description, url: "/", siteName: title, images: [{ url: image, width: 1200, height: 630, alt: "Wayfarer's Archive — offline knowledge carried carefully" }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
