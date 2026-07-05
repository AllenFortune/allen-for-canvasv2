import React from 'react';
import { Link } from "react-router-dom";
import VsPage from "@/components/seo/VsPage";
import { FaqItem } from "@/components/seo/FaqSection";

const faqs: FaqItem[] = [
  {
    question: "What's the main difference between Allen Grade Assist and GradeWithAI?",
    answer: "Audience and depth of focus. GradeWithAI describes itself as built specifically for K-12 teachers, spanning Canvas, Google Classroom, and Google Forms. Allen Grade Assist is built for higher-ed Canvas instructors by a practicing college professor who grades his own courses with it — one LMS, done deeply, with workflows shaped by college discussion boards, essays, and exams.",
  },
  {
    question: "Don't both tools grade Canvas discussions and quizzes?",
    answer: "Both tools' sites describe grading Canvas discussions and quiz questions, and both connect with a Canvas access token and pass grades back. On paper the feature lists overlap heavily. The difference is who each was tuned for: GradeWithAI's positioning and testimonials are K-12 classrooms; Allen Grade Assist's grading flows were built and are used every semester in college psychology courses.",
  },
  {
    question: "Which is cheaper?",
    answer: "It depends on volume. GradeWithAI's free tier is 25 AI requests/month and its Pro plan is $20/month for unlimited grading. Allen Grade Assist's plans are $9/month for 250 submissions, $19/month for 750, and $59/month unlimited. At moderate volume Allen Grade Assist costs less; if you truly grade unlimited volume every month, GradeWithAI's $20 unlimited is the cheaper unlimited tier.",
  },
  {
    question: "Does GradeWithAI have features Allen Grade Assist doesn't?",
    answer: "Yes. GradeWithAI includes an AI-writing detection score with each submission and grades handwritten/scanned work, and it supports Google Classroom and Google Forms alongside Canvas. Allen Grade Assist doesn't do AI detection or handwriting, and it's Canvas-only by design.",
  },
  {
    question: "Why does higher-ed vs K-12 matter for an AI grader?",
    answer: "The grading norms differ: college discussion rubrics reward argument quality and use of course concepts rather than completion; feedback tone is written for adults; partial credit on short-answer exams follows discipline conventions. A tool built and used by a professor bakes those norms into its drafts, which means less editing before you approve.",
  },
];

const VsGradeWithAi = () => (
  <VsPage
    competitorName="GradeWithAI"
    path="/vs/gradewithai"
    seoTitle={"Allen Grade Assist vs GradeWithAI — Canvas AI Grading Compared (2026)"}
    seoDescription={"GradeWithAI is a capable K-12-focused AI grader spanning Canvas and Google Classroom. Allen Grade Assist is built for higher-ed Canvas by a professor who grades with it. Honest comparison: pricing, features, and fit."}
    heroTitle="Allen Grade Assist vs GradeWithAI"
    heroSubtitle="Feature lists overlap more here than with any other tool — both grade Canvas discussions, assignments, and quiz questions, and both pass grades back. The real difference is who each was built for: GradeWithAI says it plainly — K-12 teachers. Allen Grade Assist is built for college instructors, by one."
    pickThemIf={[
      "You teach K-12 — it's their stated audience, and the rubric and testimonial ecosystem match it.",
      "You want an AI-writing detection score attached to every graded submission.",
      "You grade handwritten or scanned work, or use Google Classroom / Google Forms alongside Canvas.",
      "You grade genuinely unlimited volume and want the cheapest unlimited tier ($20/month).",
    ]}
    pickAgaIf={[
      "You teach in higher ed and want drafts tuned to college discussion boards, essays, and exams — not adapted from K-12.",
      "You want the founder answering for grading quality: a practicing professor who runs his own courses through it every semester.",
      "You grade moderate volume and want lower entry pricing ($9/month for 250 submissions).",
      "You want a Canvas specialist rather than a multi-LMS generalist.",
    ]}
    tableRows={[
      { label: "Built for", competitor: "\"Built specifically for K-12 teachers\" (their words)", aga: "Higher-ed Canvas instructors" },
      { label: "LMS coverage", competitor: "Canvas, Google Classroom, Google Forms; Teams on district plans", aga: "Canvas only — by design" },
      { label: "Grades discussions", competitor: "Yes — posts and replies (per their Canvas page)", aga: "Yes — posts and replies, per-student feedback" },
      { label: "Grades quiz questions", competitor: "Yes — essay, short answer, fill-in-blank (per their Canvas page)", aga: "Yes — question-by-question drafts" },
      { label: "Canvas passback", competitor: "Yes — scores + comments to SpeedGrader/gradebook", aga: "Yes — grades + feedback to the Canvas gradebook" },
      { label: "AI detection", competitor: "Yes — 0-100% AI score per submission", aga: "No — focused on feedback drafting, not detection" },
      { label: "Handwritten/scanned work", competitor: "Yes", aga: "No — digital submissions (text entries and file uploads)" },
      { label: "Free tier", competitor: "25 AI requests/month", aga: "10 submissions, full Canvas integration" },
      { label: "Pricing", competitor: "Pro $20/mo unlimited; district plans custom", aga: "$9/mo for 250 · $19/mo for 750 · $59/mo unlimited" },
      { label: "Who built it", competitor: "EdTech team serving K-12 teachers", aga: "A practicing psychology professor who grades his own courses with it" },
    ]}
    sections={[
      {
        title: "Where GradeWithAI is genuinely strong",
        body: (
          <p>
            This is the closest feature-for-feature competitor we compare against, and it deserves the credit: their
            Canvas page describes token-based setup with no district approval, discussion and quiz grading, rubric
            generation, and SpeedGrader passback — plus things we don't do at all, like AI-writing detection scores
            and handwritten/scanned submissions. Their published privacy posture is serious too (encryption at rest
            and in transit, no student data in model training, deletion windows).
          </p>
        ),
      },
      {
        title: "The K-12 question",
        body: (
          <>
            <p>
              GradeWithAI describes itself as built specifically for K-12 teachers — that's their own positioning,
              not our characterization. Nothing wrong with it; K-12 is a huge market. But grading a college
              discussion board is not grading a 9th-grade one: the rubric rewards argumentation and use of course
              concepts, the feedback register is adult-to-adult, and partial credit on exam questions follows
              discipline conventions. Drafts tuned to the wrong register mean more rewriting before you can approve —
              which is the time you were trying to save.
            </p>
            <p>
              Allen Grade Assist's drafts come out of an actual college workflow: the founder is a full-time
              psychology professor who runs his own <Link to="/grade-canvas-discussions" className="text-indigo-600 font-medium hover:text-indigo-700">discussions</Link>,{' '}
              <Link to="/grade-canvas-assignments" className="text-indigo-600 font-medium hover:text-indigo-700">written assignments</Link>, and{' '}
              <Link to="/canvas-quiz-grading" className="text-indigo-600 font-medium hover:text-indigo-700">quiz questions</Link> through
              it every semester. When something reads wrong for a college course, he's the first to hit it.
            </p>
          </>
        ),
      },
      {
        title: "Pricing, plainly",
        body: (
          <p>
            Their free tier is 25 AI requests a month; ours is 10 submissions with full Canvas integration. Their
            paid story is one $20/month unlimited plan; ours is graduated — $9 for 250 submissions, $19 for 750,
            $59 unlimited. If you grade a few hundred submissions a month, we're cheaper. If you truly grade
            unlimited volume, their $20 unlimited beats our $59 — that's the honest math. Privacy details for both
            approaches live on our <Link to="/security-and-privacy" className="text-indigo-600 font-medium hover:text-indigo-700">Security &amp; Privacy page</Link>.
          </p>
        ),
      },
    ]}
    faqs={faqs}
    factCheckNote="GradeWithAI details from gradewithai.com (pricing, Canvas, and student-data-privacy pages), checked July 2026. Spot something outdated? Contact us and we'll correct it."
  />
);

export default VsGradeWithAi;
