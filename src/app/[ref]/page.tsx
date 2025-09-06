import type { Metadata } from "next";
import Home from "../page";

interface Props {
  params: Promise<{
    ref: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ref } = await params;
  
  return {
    title: "Konekt - Your new job is one conversation away",
    description: "We set up anonymous one-on-one meetings between students and industry professionals. Ask candid questions that give you real answers, not rehearsed talking points.",
    keywords: ["conversations", "advice", "interviewing", "job-hunting", "networking"],
    authors: [{ name: "Konekt" }],
    openGraph: {
      title: "Konekt - Your new job is one conversation away",
      description: "We set up anonymous one-on-one meetings between students and industry professionals. Ask candid questions that give you real answers, not rehearsed talking points.",
      url: `https://letskonekt.com/${ref}`,
      siteName: "Konekt",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Konekt - Your new job is one conversation away",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Konekt - Your new job is one conversation away",
      description: "We set up anonymous one-on-one meetings between students and industry professionals. Ask candid questions that give you real answers, not rehearsed talking points.",
      images: ["/og-image.png"],
      creator: "@letskonekt",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ReferralPage({ params }: Props) {
  return <Home />;
}