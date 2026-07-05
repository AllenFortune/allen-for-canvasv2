import React from 'react';
import { Link } from "react-router-dom";
import VsPage from "@/components/seo/VsPage";
import { FaqItem } from "@/components/seo/FaqSection";

const faqs: FaqItem[] = [
  {
    question: "What's the main difference between Allen Grade Assist and TimelyGrader?",
    answer: "Who the product is sold to. TimelyGrader positions itself as 'Institution Ready' and gates its full LMS API integration and quiz/exam grading behind a custom-priced institutional tier. Allen Grade Assist is built for the individual instructor: you connect your own Canvas account in minutes and get discussions, assignments, and quiz grading on a $9/month personal plan — no IT department, no procurement cycle.",
  },
  {
    question: "Isn't TimelyGrader the official Canvas AI grader?",
    answer: "TimelyGrader is an Instructure Professional-Tier partner with a Canvas Certified Integration, and Instructure has featured it in case studies — that's a genuine credential. It isn't 'the official Canvas grader,' though; Canvas doesn't have one. Allen Grade Assist is an independent third-party tool that integrates with Canvas through its public API using a token you control.",
  },
  {
    question: "Can I use TimelyGrader without my institution adopting it?",
    answer: "They offer Free and Starter ($12/month) tiers for individuals, but as of July 2026 their pricing page lists LMS API integration and quiz/exam grading under the custom-priced Institution tier. With Allen Grade Assist, full Canvas integration — including quiz short-answer grading — is included on every plan, starting with the free trial.",
  },
  {
    question: "Does TimelyGrader grade Canvas discussion boards?",
    answer: "As of July 2026, TimelyGrader's capabilities and instructor pages don't mention discussion-board grading. Allen Grade Assist grades discussions — initial posts and replies — as a first-class feature.",
  },
  {
    question: "What does TimelyGrader do well?",
    answer: "Its SpeedGrader passback is genuinely deep — overall grades, rubric criteria scores, and inline comments — and it grades formats like presentations, spreadsheets, and video. It also carries strong compliance credentials (SOC 2 Type II, HECVAT). If your institution is evaluating a campus-wide AI grading platform, it belongs on the shortlist.",
  },
];

const VsTimelyGrader = () => (
  <VsPage
    competitorName="TimelyGrader"
    path="/vs/timelygrader"
    seoTitle={"Allen Grade Assist vs TimelyGrader — Canvas AI Grading Compared (2026)"}
    seoDescription={"TimelyGrader is an Instructure partner aimed at institutional adoption; Allen Grade Assist is the professor-built tool an individual Canvas instructor sets up in minutes. Honest comparison: pricing, Canvas depth, discussions, quizzes."}
    heroTitle="Allen Grade Assist vs TimelyGrader"
    heroSubtitle="TimelyGrader is probably our most credible competitor — an Instructure partner with real SpeedGrader passback. The difference is who each tool is for: TimelyGrader is built to be bought by institutions. Allen Grade Assist is built to be used by you, this week, on your own courses."
    pickThemIf={[
      "Your institution is running a formal evaluation and wants an Instructure Professional-Tier partner with a Canvas Certified Integration.",
      "You grade formats beyond writing — presentations, spreadsheets, video — and want AI first-pass feedback on them.",
      "You need institutional features: admin dashboards, accreditation data export, multiple graders per course.",
      "SOC 2 Type II and HECVAT paperwork are hard requirements for adoption on your campus.",
    ]}
    pickAgaIf={[
      "You're one instructor with a grading problem, not a procurement committee — connect your own Canvas account today.",
      "Discussion boards are a big share of your grading; you want posts and replies graded with individualized feedback.",
      "You want quiz short-answer/essay grading without a custom-priced institutional contract.",
      "You want a tool whose builder grades with it — a practicing professor, not a platform vendor.",
    ]}
    tableRows={[
      { label: "Built for", competitor: "Institutional adoption (\"Institution Ready\"); higher ed", aga: "Individual higher-ed instructors on Canvas" },
      { label: "Setup", competitor: "Launches from Canvas via LMS authentication; full LMS API integration listed under the Institution tier", aga: "Self-serve: paste your own Canvas token, grading in minutes — no IT involvement" },
      { label: "Grades discussions", competitor: "Not mentioned on their site (July 2026)", aga: "Yes — initial posts + replies, per-student feedback" },
      { label: "Grades assignments", competitor: "Yes — papers, plus presentations, spreadsheets, video", aga: "Yes — text entries and file uploads" },
      { label: "Grades quizzes/exams", competitor: "Listed under the custom-priced Institution tier", aga: "Yes — on every plan, including the free trial" },
      { label: "Canvas passback", competitor: "Yes — grades, rubric criteria scores, inline comments to SpeedGrader", aga: "Yes — grades + feedback to the Canvas gradebook" },
      { label: "Individual pricing", competitor: "Free tier; Starter $12/mo ($10 annual)", aga: "Free trial (10 submissions); $9/mo for 250; $59/mo unlimited" },
      { label: "Compliance posture", competitor: "SOC 2 Type II, HECVAT 4.0 Ready, FERPA, WCAG 2.2 AA", aga: "Tokens encrypted at rest, no AI training on student work, instructor approves every grade" },
      { label: "Who built it", competitor: "EdTech company, Instructure Professional-Tier partner", aga: "A practicing psychology professor who grades his own courses with it" },
    ]}
    sections={[
      {
        title: "The Instructure partnership, honestly",
        body: (
          <p>
            TimelyGrader's strongest card is real: Instructure features it in case studies and webinars, and its
            SpeedGrader passback — rubric criteria scores and inline comments included — is genuinely deep. If your
            campus is selecting an AI grading platform top-down, it deserves its shortlist spot. We're not going to
            pretend otherwise.
          </p>
        ),
      },
      {
        title: "The catch: the best parts are institution-gated",
        body: (
          <>
            <p>
              Look at their pricing page closely (we did, July 2026): full LMS API integration and quiz/exam grading
              sit in the custom-priced Institution tier — not the $12/month Starter plan. The product is oriented at
              institutional decision-makers, which is fine if you are one. If you're a professor with 120 ungraded
              discussion posts tonight, "contact sales" is not a workflow.
            </p>
            <p>
              Allen Grade Assist inverts that: every plan, including the free trial, has full Canvas integration —{' '}
              <Link to="/grade-canvas-discussions" className="text-indigo-600 font-medium hover:text-indigo-700">discussions</Link>,{' '}
              <Link to="/grade-canvas-assignments" className="text-indigo-600 font-medium hover:text-indigo-700">assignments</Link>, and{' '}
              <Link to="/canvas-quiz-grading" className="text-indigo-600 font-medium hover:text-indigo-700">quiz questions</Link>.
              You connect your own account with your own token and revoke it whenever you like.
            </p>
          </>
        ),
      },
      {
        title: "Same philosophy, different scale",
        body: (
          <p>
            Both tools are honest about the same thing: AI drafts, the instructor decides. TimelyGrader calls it
            "human-in-the-loop"; we call it "the AI never finalizes a grade." Where we differ is scale and
            accountability — Allen Grade Assist is built and used daily by one professor whose own courses run
            through it, and student work is never used to train AI models
            (<Link to="/security-and-privacy" className="text-indigo-600 font-medium hover:text-indigo-700">Security &amp; Privacy</Link>).
          </p>
        ),
      },
    ]}
    faqs={faqs}
    factCheckNote="TimelyGrader details from timelygrader.ai (pricing, capabilities, and instructor pages) and instructure.com, checked July 2026. Spot something outdated? Contact us and we'll correct it."
  />
);

export default VsTimelyGrader;
