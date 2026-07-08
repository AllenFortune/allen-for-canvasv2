import React from 'react';
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";

const SITE_URL = "https://allengradeassist.com";
const AUTHOR_IMAGE = `${SITE_URL}/lovable-uploads/d644e2ea-e597-4168-bff4-35ee20a31995.png`;

export const authorJsonLd = {
  "@type": "Person",
  name: "Allen Fortune",
  jobTitle: "Full-Time Psychology Faculty",
  worksFor: {
    "@type": "CollegeOrUniversity",
    name: "Lemoore College (West Hills Community College District)",
  },
  image: AUTHOR_IMAGE,
  url: `${SITE_URL}/about`,
};

interface ArticleLayoutProps {
  title: string;
  description: string;
  /** Path only, e.g. "/blog/rubric-design-for-ai-grading". */
  path: string;
  /** ISO date, e.g. "2026-07-07". */
  datePublished: string;
  dateModified?: string;
  children: React.ReactNode;
}

/**
 * Shared shell for blog articles: per-route head tags, Article JSON-LD with the
 * founder as attributed author (E-E-A-T), visible byline, prose body, one CTA.
 */
const ArticleLayout = ({ title, description, path, datePublished, dateModified, children }: ArticleLayoutProps) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    author: authorJsonLd,
    publisher: { "@type": "Organization", name: "Allen Grade Assist", url: SITE_URL },
    datePublished,
    dateModified: dateModified ?? datePublished,
    mainEntityOfPage: `${SITE_URL}${path}`,
  };

  const displayDate = new Date(`${datePublished}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Seo title={`${title} | Allen Grade Assist`} description={description} path={path} jsonLd={jsonLd} />

      <article className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-4">
          <Link to="/blog" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">← All articles</Link>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">{title}</h1>

        <div className="flex items-center gap-4 pb-8 mb-8 border-b border-gray-200">
          <img
            src="/lovable-uploads/d644e2ea-e597-4168-bff4-35ee20a31995.png"
            alt="Allen Fortune"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <Link to="/about" className="font-semibold text-gray-900 hover:text-indigo-600">Allen Fortune</Link>
            <p className="text-sm text-gray-500">
              Full-Time Psychology Faculty, Lemoore College · {displayDate}
            </p>
          </div>
        </div>

        <div className="prose prose-lg prose-indigo max-w-none prose-headings:text-gray-900 prose-p:text-gray-700">
          {children}
        </div>

        <div className="mt-12 bg-indigo-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Grade your next Canvas stack with a working draft in front of you</h2>
          <p className="text-gray-600 mb-6">
            Allen Grade Assist drafts rubric-aligned feedback for Canvas discussions, assignments, and quizzes. You review, edit, and approve every grade.
          </p>
          <Link to="/canvas-setup">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">Start Free Trial</Button>
          </Link>
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default ArticleLayout;
