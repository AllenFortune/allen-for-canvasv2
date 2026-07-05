import React from 'react';
import Seo from "@/components/Seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FaqSection, { faqJsonLd, FaqItem } from "@/components/seo/FaqSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, FileText, ListChecks, Shield, CheckCircle, GraduationCap } from 'lucide-react';

const faqs: FaqItem[] = [
  {
    question: "How does AI grading work with Canvas?",
    answer: "Allen Grade Assist connects to your Canvas account through a secure API token you generate in Canvas settings. It imports your courses, assignments, discussions, and quizzes, then drafts rubric-aligned feedback and a suggested score for each submission. You review and edit every draft, and approved grades and comments pass back to your Canvas gradebook automatically.",
  },
  {
    question: "Does the AI decide final grades?",
    answer: "No. The AI drafts feedback and a suggested score; you decide. Nothing reaches a student or the gradebook until you review and approve it. You can edit any comment or change any score before it posts back to Canvas.",
  },
  {
    question: "What types of Canvas work can it grade?",
    answer: "Discussion boards (including replies), written assignments with text entries or file uploads, and quiz questions that need manual grading such as short answer and essay questions. It grades against your rubric when one is attached, or against criteria you provide.",
  },
  {
    question: "Is it safe to use with student work? What about FERPA?",
    answer: "Student submissions are processed only to generate your feedback draft — they are not used to train AI models, and Canvas access tokens are encrypted at rest. Allen Grade Assist is designed to support instructors' FERPA obligations; see our Security & Privacy page for the full data-handling breakdown.",
  },
  {
    question: "How much does it cost?",
    answer: "The free trial includes 10 graded submissions with no credit card required. Paid plans start at $9/month for 250 submissions, with a Core plan at $19/month for 750 and an unlimited Full-Time plan at $59/month.",
  },
  {
    question: "Who built Allen Grade Assist?",
    answer: "A full-time psychology professor at a California community college who uses it to grade his own courses every semester. It was built to solve a real grading workload, not as a generic AI wrapper.",
  },
];

const CanvasAiGrading = () => {
  const navigate = useNavigate();
  const workflow = [
    { step: "1", title: "Connect Canvas", description: "Generate an access token in your Canvas settings and paste it in once. Your token is encrypted at rest and the connection is read/write only for the grading actions you take." },
    { step: "2", title: "Import your courses", description: "Your courses, assignments, discussions, and quizzes appear in one dashboard, with ungraded submissions surfaced so you can see what actually needs attention." },
    { step: "3", title: "AI drafts, you decide", description: "For each submission the AI drafts rubric-aligned feedback and a suggested score. You read it, edit it, or rewrite it — every grade is yours." },
    { step: "4", title: "Grades pass back to Canvas", description: "Approved scores and comments post directly to your Canvas gradebook, exactly where students and SpeedGrader expect them. No copy-paste." },
  ];
  const gradeTypes = [
    { icon: <MessageSquare className="w-8 h-8 text-indigo-600" />, title: "Discussion Boards", description: "Initial posts and replies evaluated together, with individualized feedback per student.", to: "/grade-canvas-discussions" },
    { icon: <FileText className="w-8 h-8 text-indigo-600" />, title: "Written Assignments", description: "Essays and written work — text entries and uploaded files — graded against your rubric.", to: "/grade-canvas-assignments" },
    { icon: <ListChecks className="w-8 h-8 text-indigo-600" />, title: "Quiz Short Answers", description: "Question-by-question drafts for the short-answer and essay questions Canvas can't auto-grade.", to: "/canvas-quiz-grading" },
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Seo
        title={"Canvas AI Grading — Rubric-Aligned Feedback You Approve | Allen Grade Assist"}
        description={"AI grading built for Canvas LMS: import discussions, assignments, and quizzes, get rubric-aligned feedback drafts, review, and pass grades back to Canvas. Built by a professor. 10 free submissions."}
        path="/canvas-ai-grading"
        jsonLd={faqJsonLd(faqs)}
      />

      <section className="bg-gradient-to-br from-indigo-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI Grading for Canvas, Built by a Professor Who Grades in It
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Allen Grade Assist imports your Canvas discussions, assignments, and quizzes, drafts rubric-aligned
            feedback for every submission, and passes your approved grades straight back to the Canvas gradebook.
            The AI drafts. You decide.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate("/canvas-setup")}>
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate("/pricing")}>
              View Pricing
            </Button>
          </div>
          <p className="text-gray-500 text-sm mt-4">No credit card required • 10 free submissions</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">How Canvas AI Grading Works</h2>
          <p className="text-xl text-gray-600 text-center max-w-2xl mx-auto mb-16">
            Four steps from a full grading queue to a full gradebook — without leaving your review seat.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflow.map((item) => (
              <Card key={item.step} className="h-full">
                <CardHeader>
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold mb-3">{item.step}</div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Everything Canvas Makes You Grade by Hand</h2>
          <p className="text-xl text-gray-600 text-center max-w-2xl mx-auto mb-16">
            Canvas auto-grades multiple choice. Everything else lands on you. That's the part we help with.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {gradeTypes.map((type) => (
              <Card key={type.title} className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    {type.icon}
                    <CardTitle className="text-xl ml-3">{type.title}</CardTitle>
                  </div>
                  <p className="text-gray-600">{type.description}</p>
                </CardHeader>
                <CardContent>
                  <Link to={type.to} className="text-indigo-600 font-medium hover:text-indigo-700">
                    Learn more →
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <div className="flex items-center mb-4">
                <CheckCircle className="w-8 h-8 text-indigo-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">"Is AI grading accurate?"</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                The honest answer: AI feedback is a strong first draft, not a final verdict — which is exactly how
                Allen Grade Assist treats it. Drafts follow your rubric, and nothing posts to Canvas until you've
                read and approved it. Most instructors find they shift from writing feedback to editing it, which is
                where the time savings come from without giving up judgment.
              </p>
            </div>
            <div>
              <div className="flex items-center mb-4">
                <Shield className="w-8 h-8 text-indigo-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">"What about student privacy?"</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Student work is processed only to generate your feedback draft and is not used to train AI models.
                Canvas tokens are encrypted at rest, and you can revoke access from Canvas at any time. The full
                data-handling breakdown is on our{' '}
                <Link to="/security-and-privacy" className="text-indigo-600 font-medium hover:text-indigo-700">Security &amp; Privacy page</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-indigo-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <GraduationCap className="w-12 h-12 text-indigo-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Built in a Real Classroom, Not a Boardroom</h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Allen Grade Assist was built by a full-time psychology professor at a California community college who
            grades his own discussion boards, essays, and quizzes with it every semester. Every feature exists
            because a real grading queue demanded it — high course loads, no TA, and feedback students actually read.
          </p>
        </div>
      </section>

      <FaqSection items={faqs} />

      <section className="py-20 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Get Your Evenings Back This Semester</h2>
          <p className="text-xl text-indigo-100 mb-8">
            Connect Canvas, grade 10 submissions free, and see how the drafts hold up on your own rubric.
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

export default CanvasAiGrading;
