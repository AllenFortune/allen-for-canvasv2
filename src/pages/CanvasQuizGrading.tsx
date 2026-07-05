import React from 'react';
import Seo from "@/components/Seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FaqSection, { faqJsonLd, FaqItem } from "@/components/seo/FaqSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { ListChecks, PenLine, Layers, CheckCircle } from 'lucide-react';

const faqs: FaqItem[] = [
  {
    question: "Can AI grade short-answer questions in Canvas quizzes?",
    answer: "Yes. Canvas auto-grades multiple choice but leaves short-answer and essay questions for manual grading. Allen Grade Assist imports those responses and drafts a suggested score and feedback for each answer, question by question, which you review and approve.",
  },
  {
    question: "How does question-by-question grading work?",
    answer: "Each quiz question that needs manual grading is evaluated on its own: the AI sees the question, the student's answer, and your criteria, then drafts a score and comment for that specific question. You move through the quiz the same way you would in Canvas, but with the writing already drafted.",
  },
  {
    question: "Does it handle essay questions on quizzes and exams?",
    answer: "Yes. Longer essay-style quiz questions are graded the same way as short answers — against the question and your expectations for a full-credit response — with more substantive feedback drafts to match.",
  },
  {
    question: "Do quiz grades go back into Canvas automatically?",
    answer: "Approved scores and feedback post back to Canvas for the quiz, so your gradebook updates without retyping anything. Nothing posts until you approve it.",
  },
  {
    question: "Is student quiz data kept private?",
    answer: "Quiz responses are processed only to generate your feedback drafts and are not used to train AI models. Canvas tokens are encrypted at rest, and access can be revoked from Canvas at any time. See our Security & Privacy page for full details.",
  },
];

const CanvasQuizGrading = () => {
  const navigate = useNavigate();
  const points = [
    { icon: <ListChecks className="w-8 h-8 text-indigo-600" />, title: "The questions Canvas can't grade", description: "Multiple choice grades itself. Short answer and essay questions sit in your queue waiting for a human — that's the part Allen Grade Assist drafts for you." },
    { icon: <PenLine className="w-8 h-8 text-indigo-600" />, title: "Question-by-question drafts", description: "Every manual question gets its own evaluation: the question, the student's answer, and a drafted score with feedback — so partial credit is reasoned, not eyeballed." },
    { icon: <Layers className="w-8 h-8 text-indigo-600" />, title: "Consistent across the whole section", description: "Question 4 gets judged by the same standard for every student in the class, whether it's the first response you review or the ninetieth." },
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Seo
        title={"Canvas Quiz Grading with AI — Short Answer & Essay Questions | Allen Grade Assist"}
        description={"Grade Canvas quiz short-answer and essay questions with AI: question-by-question feedback drafts and suggested scores, reviewed and approved by you, posted back to the Canvas gradebook."}
        path="/canvas-quiz-grading"
        jsonLd={faqJsonLd(faqs)}
      />

      <section className="bg-gradient-to-br from-indigo-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Grade Canvas Quiz Short Answers with AI
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Canvas auto-grades the multiple choice and leaves you the short-answer and essay questions. Allen Grade
            Assist drafts a score and feedback for each of those responses, question by question — you review,
            adjust, and approve, and grades post back to Canvas.
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
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Built for the Manual Half of Quiz Grading</h2>
          <p className="text-xl text-gray-600 text-center max-w-2xl mx-auto mb-16">
            Exams and quizzes with written components are where grading time hides. This is how it gets handled.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {points.map((point) => (
              <Card key={point.title} className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    {point.icon}
                    <CardTitle className="text-xl ml-3">{point.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{point.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">The Quiz Grading Workflow</h2>
          <div className="space-y-6">
            {[
              { step: "1", text: "Pick a quiz. Allen Grade Assist imports student responses for the questions that need manual grading." },
              { step: "2", text: "The AI drafts a suggested score and feedback for each short-answer or essay response, one question at a time." },
              { step: "3", text: "You review drafts alongside each student's answer — approve, adjust partial credit, or rewrite the comment." },
              { step: "4", text: "Approved scores post back to Canvas and your quiz grades are complete, without hand-typing feedback per question." },
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
              <span className="font-semibold">You control every point.</span> Suggested scores are drafts — partial
              credit decisions stay yours, and nothing reaches the gradebook until you approve it. Privacy details are
              on our <Link to="/security-and-privacy" className="text-indigo-600 font-medium hover:text-indigo-700">Security &amp; Privacy page</Link>.
            </p>
          </div>
        </div>
      </section>

      <FaqSection items={faqs} />

      <section className="py-20 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Finish Quiz Grading the Same Day You Start</h2>
          <p className="text-xl text-indigo-100 mb-8">
            Try it on your next quiz with written questions — 10 free submissions, your own courses.
          </p>
          <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100" onClick={() => navigate("/canvas-setup")}>
            Start Free Trial
          </Button>
          <p className="text-indigo-200 text-sm mt-4">
            Grading essays or discussions too? See{' '}
            <Link to="/grade-canvas-assignments" className="underline hover:text-white">assignment grading</Link> and{' '}
            <Link to="/grade-canvas-discussions" className="underline hover:text-white">discussion grading</Link>.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CanvasQuizGrading;
