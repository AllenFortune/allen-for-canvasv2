import React from 'react';
import Seo from "@/components/Seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FaqSection, { faqJsonLd, FaqItem } from "@/components/seo/FaqSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Lock, EyeOff, UserCheck, KeyRound, Building2 } from 'lucide-react';

const faqs: FaqItem[] = [
  {
    question: "Is AI grading FERPA compliant?",
    answer: "FERPA compliance ultimately rests with the instructor and institution — there is no 'FERPA certification' for software. Allen Grade Assist is designed to support your FERPA obligations: student work is processed only to generate feedback drafts, is not used to train AI models, and is not sold or shared. Final grading decisions always remain with the instructor.",
  },
  {
    question: "Is student work used to train AI models?",
    answer: "No. Student submissions are sent to the AI provider solely to generate your feedback draft and are not used to train models. Allen Grade Assist does not sell or share student data.",
  },
  {
    question: "How is my Canvas access token protected?",
    answer: "Your Canvas token is encrypted at rest in the database with keys held in a managed secrets vault — never stored in application code. Canvas API calls run through secured server-side functions rather than from the browser, and you can revoke the token from your Canvas settings at any time, which immediately cuts off access.",
  },
  {
    question: "What student data does Allen Grade Assist store?",
    answer: "Only what grading requires: submission content is processed to draft feedback, and grading records track usage and results. No advertising profiles, no data resale. Data is encrypted in transit (TLS) and sensitive credentials are encrypted at rest.",
  },
  {
    question: "Can my institution review the platform before adoption?",
    answer: "Yes. Departments and institutions evaluating the tool can reach out through the institutional inquiry page for questions about data handling, security practices, and institutional plans.",
  },
  {
    question: "How do I disconnect Allen Grade Assist from Canvas?",
    answer: "Two ways, either is sufficient: delete the access token from your Canvas account settings (which revokes access on Canvas's side immediately), or remove the connection from your Allen Grade Assist settings.",
  },
];

const SecurityAndPrivacy = () => {
  const navigate = useNavigate();
  const practices = [
    { icon: <KeyRound className="w-8 h-8 text-indigo-600" />, title: "Canvas tokens encrypted at rest", description: "Your Canvas access token is encrypted in the database using keys held in a managed secrets vault — never hardcoded, never exposed to the browser. You can revoke it from Canvas at any time." },
    { icon: <EyeOff className="w-8 h-8 text-indigo-600" />, title: "No AI training on student work", description: "Submissions are processed only to draft your feedback. They are not used to train AI models, and they are never sold or shared with advertisers." },
    { icon: <Lock className="w-8 h-8 text-indigo-600" />, title: "Encrypted in transit", description: "All traffic between your browser, our servers, and Canvas runs over TLS. Canvas API calls happen server-side through secured functions, not from your browser." },
    { icon: <UserCheck className="w-8 h-8 text-indigo-600" />, title: "Instructor holds the pen", description: "The AI drafts; you decide. No score or comment reaches a student or the Canvas gradebook until you have reviewed and approved it. Academic judgment is never delegated." },
    { icon: <Shield className="w-8 h-8 text-indigo-600" />, title: "Minimal data footprint", description: "We store what grading requires — not advertising profiles. Access to production data is restricted, and server-side endpoints enforce authentication and per-account usage checks." },
    { icon: <Building2 className="w-8 h-8 text-indigo-600" />, title: "Institution-friendly", description: "Evaluating for a department or campus? We answer security questionnaires and data-handling questions directly — start with an institutional inquiry." },
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Seo
        title={"Security & Privacy — FERPA-Conscious AI Grading for Canvas | Allen Grade Assist"}
        description={"How Allen Grade Assist protects student work: no AI training on submissions, Canvas tokens encrypted at rest, TLS in transit, and the instructor approving every grade. Built by a professor who answers to FERPA too."}
        path="/security-and-privacy"
        jsonLd={faqJsonLd(faqs)}
      />

      <section className="bg-gradient-to-br from-indigo-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Student Work Deserves More Than a Privacy Policy Link
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Allen Grade Assist was built by a professor who answers to FERPA in his own classroom. Here is exactly
            how student data is handled when AI helps with grading — no hand-waving, no fine print.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate("/canvas-setup")}>
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/institutional-inquiry")}>
              Institutional Inquiry
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">How We Handle Student Data</h2>
          <p className="text-xl text-gray-600 text-center max-w-2xl mx-auto mb-16">
            Six commitments, each one verifiable in how the product actually works.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {practices.map((practice) => (
              <Card key={practice.title} className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    {practice.icon}
                    <CardTitle className="text-xl ml-3">{practice.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{practice.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">The Straight Answer on FERPA</h2>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 space-y-4 text-gray-600 leading-relaxed">
            <p>
              You'll see AI grading tools claim to be "FERPA compliant" as if it were a certification. It isn't —
              FERPA is a law that binds institutions and the instructors acting for them, and compliance depends on
              how a tool is used under your institution's policies. Any vendor who tells you otherwise is
              marketing, not informing.
            </p>
            <p>
              What a tool <span className="font-semibold text-gray-900">can</span> do is make compliant use
              straightforward. Allen Grade Assist processes student submissions only to draft feedback for the
              instructor of record, doesn't use student work to train AI models, doesn't sell or share it, encrypts
              credentials at rest and traffic in transit, and keeps every grading decision in the instructor's hands.
              If your campus requires a vendor review before adoption, we'll participate — start with an{' '}
              <Link to="/institutional-inquiry" className="text-indigo-600 font-medium hover:text-indigo-700">institutional inquiry</Link>.
            </p>
            <p>
              For the formal terms, see our <Link to="/privacy" className="text-indigo-600 font-medium hover:text-indigo-700">Privacy Policy</Link> and{' '}
              <Link to="/terms" className="text-indigo-600 font-medium hover:text-indigo-700">Terms of Service</Link>.
            </p>
          </div>
        </div>
      </section>

      <FaqSection items={faqs} />

      <section className="py-20 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Grade with AI Without Gambling on Privacy</h2>
          <p className="text-xl text-indigo-100 mb-8">
            See how it works on your own courses — <Link to="/canvas-ai-grading" className="underline hover:text-white">Canvas AI grading</Link>,
            reviewed and approved by you, 10 free submissions.
          </p>
          <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100" onClick={() => navigate("/canvas-setup")}>
            Start Free Trial
          </Button>
          <p className="text-indigo-200 text-sm mt-4">No credit card required • 10 free submissions</p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SecurityAndPrivacy;
