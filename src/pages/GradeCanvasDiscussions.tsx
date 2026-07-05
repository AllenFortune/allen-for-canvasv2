import React from 'react';
import Seo from "@/components/Seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FaqSection, { faqJsonLd, FaqItem } from "@/components/seo/FaqSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, Clock, Scale, CheckCircle } from 'lucide-react';

const faqs: FaqItem[] = [
  {
    question: "Can AI grade Canvas discussion boards?",
    answer: "Yes. Allen Grade Assist imports each student's initial post and replies from a Canvas discussion, evaluates them against your rubric or criteria, and drafts individualized feedback with a suggested score. You review and approve before anything posts back to Canvas.",
  },
  {
    question: "Does it see student replies or just the initial post?",
    answer: "Both. The AI reads the student's initial post and their replies to classmates for the discussion being graded, so participation requirements like 'respond to two peers' can be reflected in the draft feedback and score.",
  },
  {
    question: "Will every student get the same generic comment?",
    answer: "No. Each draft responds to what that student actually wrote — quoting or referencing their points — because the AI grades one submission at a time against your rubric. You can still edit any draft before approving it.",
  },
  {
    question: "How do grades get back into Canvas?",
    answer: "Approved scores and feedback post directly to the Canvas gradebook for that discussion, the same place SpeedGrader writes to. Students see the feedback in Canvas as if you had typed it there.",
  },
  {
    question: "How much time does this actually save on discussions?",
    answer: "Instead of reading, judging, and writing feedback for every post, you read the post alongside a finished draft and edit. For a class of 30 with initial posts plus replies, most of the writing work is already done when you sit down.",
  },
];

const GradeCanvasDiscussions = () => {
  const navigate = useNavigate();
  const painPoints = [
    { icon: <Clock className="w-8 h-8 text-indigo-600" />, title: "The volume problem", description: "Thirty students, one initial post and two replies each — that's ninety pieces of writing per discussion, per week, per course. Discussion grading eats evenings faster than any other assignment type." },
    { icon: <Scale className="w-8 h-8 text-indigo-600" />, title: "The consistency problem", description: "The feedback you write for student #3 and student #28 shouldn't depend on how tired you are. Rubric-aligned drafts apply the same criteria to the first post and the last." },
    { icon: <MessageSquare className="w-8 h-8 text-indigo-600" />, title: "The feedback-quality problem", description: "By the end of a stack, comments collapse into 'Good post!' Students notice. Drafts that reference what each student actually argued keep feedback substantive all the way down." },
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Seo
        title={"Grade Canvas Discussions with AI — Posts, Replies & Rubrics | Allen Grade Assist"}
        description={"Stop spending weekends on discussion boards. Allen Grade Assist imports Canvas discussion posts and replies, drafts rubric-aligned feedback per student, and posts your approved grades back to Canvas."}
        path="/grade-canvas-discussions"
        jsonLd={faqJsonLd(faqs)}
      />

      <section className="bg-gradient-to-br from-indigo-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Grade Canvas Discussions with AI
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discussion boards are the most time-expensive thing Canvas asks you to grade. Allen Grade Assist reads
            each student's posts and replies, drafts individualized, rubric-aligned feedback, and posts your approved
            grades back to Canvas — so grading a discussion means reviewing, not writing from scratch.
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
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">Why Discussion Grading Breaks First</h2>
          <p className="text-xl text-gray-600 text-center max-w-2xl mx-auto mb-16">
            Built by a psychology professor who grades weekly discussion boards across multiple sections — these are
            the three problems it was built to fix.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {painPoints.map((point) => (
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
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">The Discussion Grading Workflow</h2>
          <div className="space-y-6">
            {[
              { step: "1", text: "Open a course and pick the discussion to grade. Allen Grade Assist pulls every student's initial post and replies from Canvas." },
              { step: "2", text: "The AI evaluates each student against your rubric or instructions — argument quality, use of course concepts, reply requirements — and drafts feedback plus a suggested score." },
              { step: "3", text: "You review each draft next to the student's actual posts. Approve it, tweak a sentence, or rewrite it entirely." },
              { step: "4", text: "Approved grades and comments post back to your Canvas gradebook. Students see your feedback in Canvas like always." },
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
              <span className="font-semibold">You stay the grader.</span> The AI never posts anything on its own —
              every score and comment is reviewed and approved by you before it reaches a student. Concerned about
              privacy? Student posts are processed only to draft your feedback and never used to train AI models.
              Details on our <Link to="/security-and-privacy" className="text-indigo-600 font-medium hover:text-indigo-700">Security &amp; Privacy page</Link>.
            </p>
          </div>
        </div>
      </section>

      <FaqSection items={faqs} />

      <section className="py-20 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Grade This Week's Discussion in One Sitting</h2>
          <p className="text-xl text-indigo-100 mb-8">
            Try it on a real discussion board — your rubric, your students, 10 free submissions.
          </p>
          <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-100" onClick={() => navigate("/canvas-setup")}>
            Start Free Trial
          </Button>
          <p className="text-indigo-200 text-sm mt-4">
            Also grading essays or quizzes? See{' '}
            <Link to="/grade-canvas-assignments" className="underline hover:text-white">assignment grading</Link> and{' '}
            <Link to="/canvas-quiz-grading" className="underline hover:text-white">quiz grading</Link>.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default GradeCanvasDiscussions;
