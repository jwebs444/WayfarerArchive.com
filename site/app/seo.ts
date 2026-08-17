import type { Metadata } from "next";

export const siteUrl = "https://wayfarerarchive.com";

const socialImage = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "Wayfarer's Archive — a library sheltered in desert stone",
};

type PageMetadata = {
  title: string;
  description: string;
  path: `/${string}` | "/";
};

export function buildMetadata({ title, description, path }: PageMetadata): Metadata {
  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: { canonical: path },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, maxImagePreview: "large" },
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "Wayfarer's Archive",
      locale: "en_US",
      images: [socialImage],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage.url],
    },
  };
}
