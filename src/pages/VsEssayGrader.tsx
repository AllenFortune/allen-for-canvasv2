import React from 'react';
import { Link } from "react-router-dom";
import VsPage from "@/components/seo/VsPage";
import { FaqItem } from "@/components/seo/FaqSection";

const faqs: FaqItem[] = [
  {
    question: "What's the main difference between Allen Grade Assist and EssayGrader?",
    answer: "Scope and audience. EssayGrader is built around essays — upload or import essays, grade them, sync back. Allen Grade Assist is built around everything a Canvas instructor grades by hand: discussion boards (posts and replies), written assignments, and quiz short-answer/essay questions. It's also built by a practicing college professor for higher-ed Canvas courses, while EssayGrader's audience and testimonials skew K-12.",
  },
  {
    question: "Can EssayGrader grade Canvas discussion boards?",
    answer: "As of July 2026, EssayGrader's site describes essay grading with Canvas assignment import and SpeedGrader passback; it doesn't mention grading Canvas discussions or quiz questions. Allen Grade Assist grades discussions — initial posts and replies — as a first-class feature.",
  },
  {
    question: "Is EssayGrader cheaper?",
    answer: "At the entry level, yes — EssayGrader's Lite plan is $6.99/month for 100 essays with word-count caps per essay. Allen Grade Assist starts at $9/month for 250 submissions across discussions, assignments, and quizzes, with no per-submission word cap. Which is cheaper depends on what and how much you grade.",
  },
  {
    question: "Does EssayGrader have features Allen Grade Assist doesn't?",
    answer: "Yes — EssayGrader bundles AI-writing detection and plagiarism detection into its grading flow, and ships a large prebuilt rubric library. Allen Grade Assist doesn't do AI or plagiarism detection; it focuses on feedback drafting, rubric-aligned scoring, and Canvas grade passback, plus an AI Rubric Builder for creating your own rubrics.",
  },
  {
    question: "Do both send grades back to Canvas?",
    answer: "Yes. Both tools push grades and feedback back to Canvas. Allen Grade Assist does it for discussions, assignments, and quiz questions; EssayGrader's passback is described for essay assignments.",
  },
];

const VsEssayGrader = () => (
  <VsPage
    competitorName="EssayGrader"
    path="/vs/essaygrader"
    seoTitle={"Allen Grade Assist vs EssayGrader — Which AI Grader for Canvas? (2026)"}
    seoDescription={"An honest comparison for Canvas instructors: EssayGrader grades essays; Allen Grade Assist grades discussions, assignments, and quiz questions in Canvas, built by a professor. Pricing, features, and who each fits."}
    heroTitle="Allen Grade Assist vs EssayGrader"
    heroSubtitle="Both use AI to cut grading time. The real question is what you grade: if your workload is essays, EssayGrader is a credible tool. If your workload is a Canvas course — discussion boards, written assignments, and quiz questions — that's what Allen Grade Assist was built for."
    pickThemIf={[
      "You grade essays almost exclusively, and per-essay word caps (1,000–8,000 depending on tier) fit your assignments.",
      "You want built-in AI-writing and plagiarism detection in the same tool.",
      "You teach K-12 — their rubric library and community skew that way.",
      "You need Google Classroom or Schoology support alongside Canvas.",
    ]}
    pickAgaIf={[
      "Discussion boards are a real part of your grading load — posts and replies, graded with individualized feedback.",
      "You grade quiz short-answer and essay questions and want per-question drafts.",
      "You teach in higher ed and want a tool built by a college professor who grades with it every semester.",
      "You want one submission allowance that covers discussions, assignments, and quizzes — no per-essay word caps.",
    ]}
    tableRows={[
      { label: "Built for", competitor: "Essay grading across Canvas, Google Classroom, Schoology; K-12-leaning audience", aga: "Canvas LMS specifically; higher-ed instructors" },
      { label: "Grades discussions", competitor: "Not mentioned on their site (July 2026)", aga: "Yes — initial posts + replies, per-student feedback" },
      { label: "Grades assignments/essays", competitor: "Yes — core feature, with word caps per tier", aga: "Yes — text entries and file uploads, no word cap" },
      { label: "Grades quiz short answers", competitor: "Not mentioned on their site (July 2026)", aga: "Yes — question-by-question drafts" },
      { label: "Canvas grade passback", competitor: "Yes — to SpeedGrader, on paid tiers", aga: "Yes — grades + feedback to the Canvas gradebook" },
      { label: "AI / plagiarism detection", competitor: "Yes — built into Pro and up", aga: "No — focused on feedback drafting, not detection" },
      { label: "Free tier", competitor: "50 essays/mo, 1,000-word cap, no LMS integration", aga: "10 submissions, full Canvas integration included" },
      { label: "Entry price", competitor: "$6.99/mo (100 essays, 2,000-word cap)", aga: "$9/mo (250 submissions, all types)" },
      { label: "Who built it", competitor: "\"Built for Teachers by Teachers\"", aga: "A practicing psychology professor who grades his own courses with it" },
    ]}
    sections={[
      {
        title: "Where EssayGrader is genuinely good",
        body: (
          <>
            <p>
              Credit where due: EssayGrader has a real free tier, cheap paid plans, a 500+ rubric library, and
              one-click passback of grades, feedback, and AI/plagiarism reports into SpeedGrader. If your grading
              life is a stream of essays and you want detection tooling bundled in, it earns its keep.
            </p>
          </>
        ),
      },
      {
        title: "Where a Canvas course outgrows it",
        body: (
          <>
            <p>
              Most higher-ed Canvas courses don't run on essays alone. The weekly grind is discussion boards —
              initial posts plus replies, times thirty students, times every section you teach — and the quiz
              short-answer questions Canvas can't auto-grade. As of July 2026, EssayGrader's site doesn't mention
              either. Allen Grade Assist treats <Link to="/grade-canvas-discussions" className="text-indigo-600 font-medium hover:text-indigo-700">discussions</Link> and{' '}
              <Link to="/canvas-quiz-grading" className="text-indigo-600 font-medium hover:text-indigo-700">quiz questions</Link> as
              first-class grading work, alongside <Link to="/grade-canvas-assignments" className="text-indigo-600 font-medium hover:text-indigo-700">written assignments</Link>.
            </p>
            <p>
              Word caps matter too: EssayGrader's tiers cap essay length (1,000 words on free, 3,500 on Pro), which
              can clip upper-division college papers. Allen Grade Assist has no per-submission word cap.
            </p>
          </>
        ),
      },
      {
        title: "The instructor-in-control question",
        body: (
          <p>
            Both tools keep a human in the loop. Allen Grade Assist's version of that: the AI drafts feedback and a
            suggested score against your rubric, and nothing reaches a student or the gradebook until you approve
            it. Student work is never used to train AI models — details on our{' '}
            <Link to="/security-and-privacy" className="text-indigo-600 font-medium hover:text-indigo-700">Security &amp; Privacy page</Link>.
          </p>
        ),
      },
    ]}
    faqs={faqs}
    factCheckNote="EssayGrader details from essaygrader.ai (pricing and Canvas integration pages), checked July 2026. Spot something outdated? Contact us and we'll correct it."
  />
);

export default VsEssayGrader;
