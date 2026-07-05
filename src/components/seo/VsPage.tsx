import React from 'react';
import Seo from "@/components/Seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FaqSection, { faqJsonLd, FaqItem } from "@/components/seo/FaqSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, Scale } from 'lucide-react';

export interface VsTableRow {
  label: string;
  competitor: string;
  aga: string;
}

export interface VsPageProps {
  competitorName: string;
  path: string;
  seoTitle: string;
  seoDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  /** Honest "pick them if" bullets — real concessions, not straw men. */
  pickThemIf: string[];
  pickAgaIf: string[];
  tableRows: VsTableRow[];
  /** Prose sections making the differentiated case. */
  sections: { title: string; body: React.ReactNode }[];
  faqs: FaqItem[];
  factCheckNote?: string;
}

/**
 * Shared template for /vs/* comparison pages. Comparisons stay honest:
 * competitor strengths are conceded up front, and every factual claim on
 * these pages traces to the vendor's own site as of the fact-check date.
 */
const VsPage = (props: VsPageProps) => {
  const navigate = useNavigate();
  const {
    competitorName, path, seoTitle, seoDescription, heroTitle, heroSubtitle,
    pickThemIf, pickAgaIf, tableRows, sections, faqs, factCheckNote,
  } = props;
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Seo title={seoTitle} description={seoDescription} path={path} jsonLd={faqJsonLd(faqs)} />

      <section className="bg-gradient-to-br from-indigo-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">{heroTitle}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">{heroSubtitle}</p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate("/canvas-setup")}>
              Try Allen Grade Assist Free
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/canvas-ai-grading")}>
              How Canvas Grading Works
            </Button>
          </div>
          <p className="text-gray-500 text-sm mt-4">No credit card required • 10 free submissions</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-center justify-center mb-10">
            <Scale className="w-8 h-8 text-indigo-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">The Honest Short Version</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="h-full border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl">Pick {competitorName} if…</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {pickThemIf.map((item, i) => (
                    <li key={i} className="flex items-start text-gray-600">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="h-full border-2 border-indigo-200 bg-indigo-50/40">
              <CardHeader>
                <CardTitle className="text-xl">Pick Allen Grade Assist if…</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {pickAgaIf.map((item, i) => (
                    <li key={i} className="flex items-start text-gray-700">
                      <CheckCircle className="w-5 h-5 text-indigo-600 mr-3 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Side by Side</h2>
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="p-4 text-gray-500 font-medium"></th>
                  <th className="p-4 text-gray-900 font-semibold">{competitorName}</th>
                  <th className="p-4 text-indigo-700 font-semibold">Allen Grade Assist</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, i) => (
                  <tr key={i} className={i % 2 ? "bg-gray-50/60" : ""}>
                    <td className="p-4 font-medium text-gray-900 align-top">{row.label}</td>
                    <td className="p-4 text-gray-600 align-top">{row.competitor}</td>
                    <td className="p-4 text-gray-700 align-top">{row.aga}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {factCheckNote && (
            <p className="text-sm text-gray-500 mt-4 text-center">{factCheckNote}</p>
          )}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          {sections.map((section, i) => (
            <div key={i}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
              <div className="text-gray-600 leading-relaxed space-y-4">{section.body}</div>
            </div>
          ))}
        </div>
      </section>

      <FaqSection items={faqs} />

      <section className="py-20 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Judge It on Your Own Courses</h2>
          <p className="text-xl text-indigo-100 mb-8">
            Connect Canvas and grade 10 real submissions free — discussions, assignments, or quizzes. Your rubric decides.
          </p>
          <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100" onClick={() => navigate("/canvas-setup")}>
            Start Free Trial
          </Button>
          <p className="text-indigo-200 text-sm mt-4">
            See what it grades: <Link to="/grade-canvas-discussions" className="underline hover:text-white">discussions</Link>,{' '}
            <Link to="/grade-canvas-assignments" className="underline hover:text-white">assignments</Link>,{' '}
            <Link to="/canvas-quiz-grading" className="underline hover:text-white">quizzes</Link> · <Link to="/security-and-privacy" className="underline hover:text-white">Security &amp; privacy</Link>
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default VsPage;
