import React from 'react';
import { Link } from "react-router-dom";
import VsPage from "@/components/seo/VsPage";
import { FaqItem } from "@/components/seo/FaqSection";

const faqs: FaqItem[] = [
  {
    question: "Is Allen Grade Assist a Gradescope alternative for Canvas?",
    answer: "For written work, yes — with an important scope difference. Gradescope is an assessment platform strongest at scanned paper exams, bubble sheets, and code autograding, typically adopted institution-wide. Allen Grade Assist is an AI feedback drafter for the written work inside Canvas: discussion boards, essays and written assignments, and quiz short-answer questions. If you're grading handwritten problem sets, keep Gradescope. If you're drowning in written submissions, that's us.",
  },
  {
    question: "Does Gradescope's AI write feedback like Allen Grade Assist does?",
    answer: "No — and Gradescope says so itself. Its AI groups similar answers so you can apply one rubric decision to many submissions; it explicitly does not generate scores or written feedback. Allen Grade Assist drafts individualized, rubric-aligned feedback and a suggested score for each student, which you review and approve.",
  },
  {
    question: "Can I use Gradescope with Canvas as an individual instructor?",
    answer: "Not fully. As of July 2026, Gradescope's pricing page lists LMS integration and AI-powered grading as Institutional-plan features — the free Basic tier doesn't include Canvas integration, and the Institutional plan is quote-only. Allen Grade Assist includes full Canvas integration on every plan, starting with the free trial, set up with your own Canvas token.",
  },
  {
    question: "What does Gradescope pass back to Canvas?",
    answer: "Per Gradescope's own documentation, only the overall score posts to the Canvas gradebook — rubric-level feedback and comments stay inside Gradescope, so students go there to see details. Allen Grade Assist posts both the grade and the written feedback into Canvas, where students already look.",
  },
  {
    question: "Does Gradescope grade Canvas discussion boards?",
    answer: "No — discussion grading isn't part of Gradescope's assignment types (scanned exams, bubble sheets, homework, code, online assignments). Allen Grade Assist grades Canvas discussions, posts and replies, as a first-class feature.",
  },
];

const VsGradescope = () => (
  <VsPage
    competitorName="Gradescope"
    path="/vs/gradescope"
    seoTitle={"Allen Grade Assist vs Gradescope — A Canvas Alternative for Written Work (2026)"}
    seoDescription={"Gradescope excels at scanned exams and code, but Canvas integration and AI grading are institution-gated — and its AI groups answers rather than drafting feedback. Allen Grade Assist drafts rubric-aligned feedback for discussions, essays, and quizzes inside Canvas."}
    heroTitle="Allen Grade Assist vs Gradescope"
    heroSubtitle="Different tools for different grading. Gradescope (by Turnitin) is an institutional assessment platform that shines on paper exams and code. Allen Grade Assist drafts actual written feedback for the Canvas work Gradescope doesn't touch — discussions, essays, and quiz short answers — and any instructor can set it up alone."
    pickThemIf={[
      "You grade scanned, handwritten paper exams or bubble sheets — Gradescope is best-in-class there.",
      "You teach CS or STEM and want code autograding and answer-similarity tooling.",
      "Your institution already licenses it — the institutional plan unlocks its real features, including LMS integration.",
      "You want the Turnitin-backed platform your colleagues across 2,600+ universities already know.",
    ]}
    pickAgaIf={[
      "Your grading load is written: discussion boards, essays, short-answer questions — work that needs feedback, not answer-grouping.",
      "You want AI that drafts individualized feedback per student, not clustering that still leaves the writing to you.",
      "You're an individual instructor — full Canvas integration on every plan, no institutional license or quote-only sales call.",
      "You want feedback to land in Canvas where students already look, not in a separate platform.",
    ]}
    tableRows={[
      { label: "Built for", competitor: "Institutional assessment: scanned exams, bubble sheets, code, problem sets; STEM-leaning", aga: "Individual Canvas instructors grading written work" },
      { label: "What its AI does", competitor: "Groups similar answers for batch rubric decisions; explicitly does not generate scores or feedback", aga: "Drafts individualized, rubric-aligned feedback + suggested score per student" },
      { label: "Grades discussions", competitor: "No — not an assignment type", aga: "Yes — initial posts + replies, per-student feedback" },
      { label: "Essays / written work", competitor: "Supported as assignment type, but their AI grouping is weakest on open-ended writing", aga: "Core use case — text entries and file uploads" },
      { label: "Quiz short answers", competitor: "Answer-grouping on structured responses (institutional feature)", aga: "Yes — per-question feedback drafts on every plan" },
      { label: "Canvas integration", competitor: "LTI 1.3, but listed as an Institutional-plan feature — not on the free Basic tier", aga: "Included on every plan, via your own Canvas token" },
      { label: "What reaches Canvas", competitor: "Overall score only; rubric feedback stays in Gradescope", aga: "Grade + written feedback, posted into the Canvas gradebook" },
      { label: "Individual pricing", competitor: "Free Basic tier (no LMS, no AI grading); Institutional plan is quote-only", aga: "Free trial (10 submissions); $9/mo for 250; $59/mo unlimited" },
      { label: "Who built it", competitor: "Turnitin (acquired); 2,600+ universities", aga: "A practicing psychology professor who grades his own courses with it" },
    ]}
    sections={[
      {
        title: "Gradescope earned its reputation — in a different lane",
        body: (
          <p>
            Let's be straight: for scanned handwritten exams, bubble sheets, and code autograding, Gradescope is the
            standard, with the institutional adoption to prove it — 2,600+ universities, 700M+ questions graded. If
            that's your grading life and your campus licenses it, you don't need an alternative.
          </p>
        ),
      },
      {
        title: "Why people search for a Gradescope alternative for Canvas anyway",
        body: (
          <>
            <p>
              Two reasons show up again and again. First, the gate: on Gradescope's own pricing page, LMS integration
              and AI-powered grading are Institutional-plan features. The free tier an individual can sign up for
              doesn't connect to Canvas — so "using Gradescope with Canvas" usually means your institution buying it.
            </p>
            <p>
              Second, the writing problem. Gradescope's AI is grouping technology — it clusters similar answers so
              you can grade many at once, and by its own description it does not generate feedback. That works for
              structured problems; it does little for a discussion board or an essay where each student needs a
              response to what they wrote. Even when it is used, only the overall score posts back to Canvas —
              the feedback lives in Gradescope.
            </p>
            <p>
              That written-work lane is exactly where Allen Grade Assist lives:{' '}
              <Link to="/grade-canvas-discussions" className="text-indigo-600 font-medium hover:text-indigo-700">discussions</Link>,{' '}
              <Link to="/grade-canvas-assignments" className="text-indigo-600 font-medium hover:text-indigo-700">written assignments</Link>, and{' '}
              <Link to="/canvas-quiz-grading" className="text-indigo-600 font-medium hover:text-indigo-700">quiz short answers</Link> — drafted
              feedback per student, reviewed by you, posted into Canvas.
            </p>
          </>
        ),
      },
      {
        title: "Privacy, since you'll ask",
        body: (
          <p>
            Gradescope documents FERPA compliance and institutional data control — legitimate. Allen Grade Assist's
            posture: student work is processed only to draft your feedback and never used to train AI models, Canvas
            tokens are encrypted at rest, and no grade posts without your approval. Full breakdown on our{' '}
            <Link to="/security-and-privacy" className="text-indigo-600 font-medium hover:text-indigo-700">Security &amp; Privacy page</Link>.
          </p>
        ),
      },
    ]}
    faqs={faqs}
    factCheckNote="Gradescope details from gradescope.com, turnitin.gradescope.com/pricing, and guides.gradescope.com, checked July 2026. Spot something outdated? Contact us and we'll correct it."
  />
);

export default VsGradescope;
