import React from 'react';
import Seo from "@/components/Seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FaqSection, { faqJsonLd, FaqItem } from "@/components/seo/FaqSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { FileText, Upload, Target, CheckCircle } from 'lucide-react';

const faqs: FaqItem[] = [
  {
    question: "Can AI grade written assignments in Canvas?",
    answer: "Yes. Allen Grade Assist imports assignment submissions from Canvas — text entries and uploaded files — and drafts rubric-aligned feedback with a suggested score for each student. You review, edit, and approve before grades post back to the Canvas gradebook.",
  },
  {
    question: "Does it work with my Canvas rubric?",
    answer: "Yes. If the assignment has a rubric attached, drafts are aligned to its criteria. If not, you can supply grading instructions, or generate a rubric first with the built-in AI Rubric Builder and export it to Canvas.",
  },
  {
    question: "Does it grade file uploads like Word docs and PDFs?",
    answer: "Yes. Submitted files are retrieved securely from Canvas and their text is read for grading, so essays submitted as uploads are handled alongside text-entry submissions.",
  },
  {
    question: "Is this a SpeedGrader replacement?",
    answer: "It works with SpeedGrader rather than replacing it. Allen Grade Assist does the drafting work up front; approved scores and comments land in the Canvas gradebook, where you and your students see them exactly as if entered through SpeedGrader.",
  },
  {
    question: "What keeps the AI from grading inaccurately?",
    answer: "Nothing posts without your approval. Drafts follow your rubric, and you review each one next to the student's actual submission. Treat it as a strong first pass: you keep full authority over the final grade, and you can rewrite any part of the feedback.",
  },
];

const GradeCanvasAssignments = () => {
  const navigate = useNavigate();
  const capabilities = [
    { icon: <FileText className="w-8 h-8 text-indigo-600" />, title: "Essays & written responses", description: "Long-form writing graded against your rubric criteria with substantive, specific feedback drafts — not one-line platitudes." },
    { icon: <Upload className="w-8 h-8 text-indigo-600" />, title: "Text entries & file uploads", description: "Whether students type into Canvas or upload a document, submissions are pulled in and read the same way." },
    { icon: <Target className="w-8 h-8 text-indigo-600" />, title: "Rubric-aligned scoring", description: "Suggested scores map to your rubric's criteria and point values, so drafts start from your standards — not a generic idea of 'good writing.'" },
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Seo
        title={"AI Grading for Canvas Assignments — Essays, Files & Rubrics | Allen Grade Assist"}
        description={"Grade Canvas assignments with AI: text entries and file uploads imported from Canvas, rubric-aligned feedback drafts for every student, and approved grades passed back to your gradebook."}
        path="/grade-canvas-assignments"
        jsonLd={faqJsonLd(faqs)}
      />

      <section className="bg-gradient-to-br from-indigo-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Assisted Grading for Canvas Assignments
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            A stack of essays in SpeedGrader means hours of reading and writing. Allen Grade Assist drafts
            rubric-aligned feedback and a suggested score for every submission — text entry or file upload — so your
            job becomes reviewing and deciding, not typing the same corrections for the thirtieth time.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate("/canvas-setup")}>
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/canvas-ai-grading")}>
              How Canvas Grading Works
            </Button>
          </div>
          <p className="text-gray-500 text-sm mt-4">No credit card required • 10 free submissions</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">What It Handles</h2>
          <p className="text-xl text-gray-600 text-center max-w-2xl mx-auto mb-16">
            Built for the open-ended work Canvas can't auto-grade.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {capabilities.map((cap) => (
              <Card key={cap.title} className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    {cap.icon}
                    <CardTitle className="text-xl ml-3">{cap.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{cap.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">From Submission Stack to Posted Grades</h2>
          <div className="space-y-6">
            {[
              { step: "1", text: "Pick an assignment. Ungraded submissions are imported from Canvas — text entries and uploaded files alike." },
              { step: "2", text: "The AI reads each submission and drafts feedback aligned to the assignment's rubric or your grading instructions, with a suggested score." },
              { step: "3", text: "You review each draft beside the student's work. Approve, adjust the score, or rewrite the feedback — your call on every single one." },
              { step: "4", text: "Approved grades and comments post to the Canvas gradebook, visible to students in the same place SpeedGrader puts them." },
            ].map((item) => (
              <div key={item.step} className="flex items-start bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold mr-4 flex-shrink-0">{item.step}</div>
                <p className="text-gray-600 leading-relaxed pt-1.5">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 bg-indigo-50 rounded-lg p-6 flex items-start">
            <CheckCircle className="w-6 h-6 text-indigo-600 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-gray-700">
              <span className="font-semibold">No rubric yet?</span> Generate one from your assignment description with
              the <Link to="/ai-rubric-builder" className="text-indigo-600 font-medium hover:text-indigo-700">AI Rubric Builder</Link> and
              export it to Canvas first — then grade against it. Student work is processed only to draft your
              feedback and never used to train AI models
              (<Link to="/security-and-privacy" className="text-indigo-600 font-medium hover:text-indigo-700">Security &amp; Privacy</Link>).
            </p>
          </div>
        </div>
      </section>

      <FaqSection items={faqs} />

      <section className="py-20 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Try It on Your Next Essay Stack</h2>
          <p className="text-xl text-indigo-100 mb-8">
            Connect Canvas and grade 10 submissions free — see how the drafts hold up against your own standards.
          </p>
          <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100" onClick={() => navigate("/canvas-setup")}>
            Start Free Trial
          </Button>
          <p className="text-indigo-200 text-sm mt-4">
            Also grading discussion boards? See{' '}
            <Link to="/grade-canvas-discussions" className="underline hover:text-white">discussion grading</Link>.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GradeCanvasAssignments;
