import React from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Download, ExternalLink } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { authorJsonLd } from "@/components/blog/ArticleLayout";

const SITE_URL = "https://allengradeassist.com";
const PATH = "/in-practice";
const TITLE = "How I Actually Use AI in My Own Course";
const DESCRIPTION =
  "Allen Fortune's real Fall 2026 Intro to Psychology syllabus at Lemoore College, including the full DIVER AI-use policy, his first-day video, and the DIVER workshop deck.";

const VIDEO_SRC = "/in-practice/diver-day-one.mp4";
const CAPTIONS_SRC = "/in-practice/diver-day-one.en.vtt";
const POSTER_SRC = "/in-practice/diver-day-one-poster.jpg";
const SYLLABUS_PDF = "/in-practice/PSYC-C1000-Intro-Psychology-Syllabus-Fall-2026-public.pdf";
const DIVER_DECK_URL = "https://allenassist.ai/diver-workshop";
const ALLENASSIST_URL = "https://allenassist.ai";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: TITLE,
  description: DESCRIPTION,
  url: `${SITE_URL}${PATH}`,
  author: authorJsonLd,
  about: {
    "@type": "Course",
    name: "PSYC C1000 — Introduction to Psychology",
    provider: {
      "@type": "CollegeOrUniversity",
      name: "Lemoore College (West Hills Community College District)",
    },
  },
  video: {
    "@type": "VideoObject",
    name: "Day one: syllabus tour and the DIVER Method",
    description: "A 90-second first-day tour of Allen Fortune's Intro to Psychology course, including how students are expected to use AI.",
    contentUrl: `${SITE_URL}${VIDEO_SRC}`,
    thumbnailUrl: `${SITE_URL}${POSTER_SRC}`,
    uploadDate: "2026-08-08",
    duration: "PT1M25S",
  },
};

const diver = [
  { letter: "D", name: "Discover", text: "use AI to explore and spark questions, not to collect finished answers." },
  { letter: "I", name: "Interact", text: "ask follow-up questions, push back, and compare AI responses with your textbook and course materials." },
  { letter: "V", name: "Verify", text: "fact-check AI claims against the textbook or a credible source before using them." },
  { letter: "E", name: "Edit & Iterate", text: "revise AI-assisted work until it reflects your own understanding, voice, and examples." },
  { letter: "R", name: "Reflect", text: "include a short note (3–5 sentences) on what AI added, what you changed, and how it shaped your learning." },
];

const float = [
  { letter: "F", text: "Forsaking your own effort" },
  { letter: "L", text: "Letting AI take over" },
  { letter: "O", text: "Overlooking personal insight" },
  { letter: "A", text: "Abandoning the learning journey" },
  { letter: "T", text: "Treating AI as a shortcut" },
];

const schedule = [
  { weeks: "1–2", topic: "Fundamentals · History & Research", work: "First-day assignment · Ch 1 assignment · Scientific Method (DIVER)" },
  { weeks: "3–4", topic: "Biopsychology", work: "Neuron model & essay · Build a Brain paper & model" },
  { weeks: "5–7", topic: "Consciousness, Sensation & Perception", work: "Sleep/Dream log · Lose Your Sense project · Intelligence in Action" },
  { weeks: "8–9", topic: "Behavioral / Cognitive Psychology", work: "Study Guide & DIVER Review · Chapter 6–8 Test (in class)" },
  { weeks: "10–11", topic: "Lifespan Psychology", work: "Adolescence & adulthood readings · 65+ interview" },
  { weeks: "12", topic: "Personal Psychology", work: "Personality class work" },
  { weeks: "13–14", topic: "Social Psychology", work: "Social Psych Experiment Research Paper & Video" },
  { weeks: "15–17", topic: "Abnormal Psychology · Stress & Health · Therapy", work: "Case study · Quiz 6 · Study Guide & DIVER Review · Final Test (in class)" },
  { weeks: "18", topic: "Finals Week", work: "See Canvas" },
];

const Section = ({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => (
  <details open={defaultOpen} className="group border-b border-gray-200 py-2">
    <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-lg font-semibold text-gray-900 hover:text-indigo-700 [&::-webkit-details-marker]:hidden">
      {title}
      <ChevronDown className="h-5 w-5 shrink-0 text-gray-500 transition-transform group-open:rotate-180" aria-hidden="true" />
    </summary>
    <div className="pb-4 text-gray-700 leading-relaxed space-y-3">{children}</div>
  </details>
);

const InPractice = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Seo title={`${TITLE} | Allen Grade Assist`} description={DESCRIPTION} path={PATH} image={`${SITE_URL}${POSTER_SRC}`} jsonLd={jsonLd} />

      <section className="bg-gradient-to-br from-indigo-50 to-white py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-indigo-600 font-semibold uppercase tracking-wide text-sm mb-4">In practice</p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">{TITLE}</h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Teachers keep asking me to show my work: if I'm going to build AI tools for classrooms, what does
            AI use look like in my own? Fair question. Here's my real syllabus for Introduction to Psychology
            this fall, the AI policy my students actually sign up for, and the video they watch on day one.
            Nothing here is a mock-up.
          </p>
          <div className="flex items-center gap-4">
            <img
              src="/lovable-uploads/d644e2ea-e597-4168-bff4-35ee20a31995.png"
              alt="Allen Fortune"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <Link to="/about" className="font-semibold text-gray-900 hover:text-indigo-600">Allen Fortune</Link>
              <p className="text-sm text-gray-500">Full-Time Psychology Faculty, Lemoore College (West Hills Community College District)</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">The short version</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-2">AI isn't banned</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                AI use is permitted in this course, as long as students use the DIVER method as their framework for it. A method, not a shortcut.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-2">The method is DIVER</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Discover, Interact, Verify, Edit &amp; Iterate, Reflect. The reflection note is where I see the thinking.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-2">FLOATed work earns nothing</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Pasted, unverified, unreflected AI output gets no credit. Every assignment is also subject to an oral review: if work looks FLOATed, the student defends their submission in a conversation with me.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">What my students see on day one</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            A 90-second tour of how the class works, including where AI fits. It's narrated by an AI avatar of me,
            which is itself part of the point: I use these tools openly, and I tell students when I do.
            Captions are on by default.
          </p>
          <div className="rounded-lg overflow-hidden shadow-lg bg-black">
            <video
              controls
              playsInline
              preload="metadata"
              poster={POSTER_SRC}
              className="w-full aspect-video"
              aria-label="Day one syllabus tour and the DIVER Method, Introduction to Psychology"
            >
              <source src={VIDEO_SRC} type="video/mp4" />
              <track kind="captions" src={CAPTIONS_SRC} srcLang="en" label="English" default />
              Your browser doesn't support embedded video. <a href={VIDEO_SRC}>Download the video</a>.
            </video>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">My AI use policy, word for word</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            This is the section of the syllabus teachers ask about most, so here it is in full. Students can use
            ChatGPT, Gemini, Perplexity, or anything similar, but only through DIVER.
          </p>

          <div className="rounded-lg border-2 border-indigo-200 bg-indigo-50/50 p-6 md:p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Use Policy — The DIVER Method</h3>
            <p className="text-gray-700 mb-5 leading-relaxed">
              AI tools (ChatGPT, Gemini, Perplexity, and similar) are part of how we learn in this course. AI use is
              permitted in this course, as long as you use the DIVER method as your framework for it:
            </p>
            <ol className="space-y-3 mb-6">
              {diver.map((d) => (
                <li key={d.letter} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 font-bold text-white" aria-hidden="true">
                    {d.letter}
                  </span>
                  <p className="text-gray-700 leading-relaxed pt-1">
                    <strong className="text-gray-900">{d.name}</strong> — {d.text}
                  </p>
                </li>
              ))}
            </ol>

            <div className="rounded-md bg-white border border-gray-200 p-5 mb-5">
              <p className="text-gray-700 leading-relaxed mb-3">
                The opposite of DIVER is <strong className="text-gray-900">FLOAT</strong>:
              </p>
              <ul className="grid sm:grid-cols-2 gap-2 mb-3">
                {float.map((f) => (
                  <li key={f.letter} className="flex items-center gap-3 text-gray-700">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-700" aria-hidden="true">
                      {f.letter}
                    </span>
                    {f.text}
                  </li>
                ))}
              </ul>
              <p className="text-gray-700 leading-relaxed">
                FLOATed work — AI output submitted as your own, unverified and unreflected — earns no credit and may
                be treated as academic dishonesty under college policy.
              </p>
            </div>

            <p className="text-gray-700 leading-relaxed mb-5">
              <strong className="text-gray-900">Oral review:</strong> Every assignment is subject to an oral review. If a
              submission looks FLOATed, you will have the chance to defend it in a short discussion with me, walking
              through how you used AI, what you verified, and what you changed.
            </p>

            <p className="text-gray-700 leading-relaxed">
              Whenever you use AI, cite it: APA-format
              citation, a brief note on how you used it, and a link to the chat when available. Uncited AI use is
              treated as plagiarism.
            </p>

            <div className="mt-6 rounded-md bg-white border border-gray-200 p-5">
              <h4 className="font-semibold text-gray-900 mb-2">How I Use AI in This Course</h4>
              <p className="text-gray-700 leading-relaxed">
                I hold myself to the same standard I ask of you: I use AI openly, not secretly. I use AI tools, including an AI teaching assistant, to help plan lessons, build course materials and videos (including an AI avatar of me), organize coursework, and draft feedback on assignments. AI does not decide your grade. I set every grade myself. If you have a question about any grade or feedback, ask me and I&apos;ll review it with you personally. I use these tools in line with college policy and with care for your privacy.
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-6">
              DIVER and FLOAT are frameworks created by Allen Fortune. © Allen Fortune. All rights reserved.
            </p>
          </div>

          <div className="mt-8 rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Why it's built this way</h3>
            <p className="text-gray-700 leading-relaxed">
              Banning AI in an intro course just moves the use out of sight. Writing the method into the syllabus
              gives students a way to use it that still requires them to think, and gives me something concrete to
              grade: did they verify, did they revise, and can they explain in their own words what the AI added?
              The Reflect step is the one that matters most. A three-sentence note tells me more about whether a
              student learned something than the polish of the final draft does.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">The full syllabus</h2>
              <p className="text-gray-600">PSYC C1000 — Introduction to Psychology · Fall 2026 · In person, Mon &amp; Wed 8:00–9:15 AM · Classroom VAAS 309</p>
            </div>
            <a href={SYLLABUS_PDF} download>
              <Button variant="outline" className="border-indigo-600 text-indigo-700 hover:bg-indigo-50">
                <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                Download PDF
              </Button>
            </a>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            My phone, email, office hours, and calendar dates are removed from this
            public copy. The course content and policies are as my students received them.
          </p>

          <div className="rounded-lg bg-white border border-gray-200 px-6">
            <Section title="Course description">
              <p>
                General Psychology is the scientific study of behavior and mental processes through the exploration of
                major theories, concepts, methods, and research findings. Topics include psychological theories,
                scientific methodology, biological bases of behavior, perception, cognition, learning, memory,
                intelligence, emotion, motivation, development, personality, social psychology, psychological
                disorders and therapies, and applied psychology.
              </p>
            </Section>

            <Section title="Student learning outcomes">
              <ul className="list-disc pl-6 space-y-2">
                <li>Demonstrate familiarity with the major concepts, theoretical perspectives, research methods, core empirical findings, and historic trends in psychology.</li>
                <li>Recognize and understand the impact of diversity on psychological research, theory, and application — including age, race, ethnicity, culture, gender, socio-economic status, disability, and sexual orientation.</li>
                <li>Understand and apply psychological principles to personal experience and to social and organizational settings.</li>
                <li>Demonstrate critical thinking skills and information competence as applied to psychological topics.</li>
              </ul>
            </Section>

            <Section title="Textbook (free)">
              <p>
                OpenStax <em>Psychology 2e</em> — free at openstax.org. Web view, PDF, and low-cost print are all fine;
                chapters are also embedded in our Canvas modules.
              </p>
            </Section>

            <Section title="How this class works">
              <p>
                We meet in person Monday and Wednesday. Most in-class activities (the "CLASS" assignments) are completed and submitted
                during class and cannot be made up if you are absent. Homework, papers, and quizzes are submitted in
                Canvas by the posted deadlines. No late work — if an extenuating circumstance comes up, message me
                before the due date.
              </p>
              <p>
                The best way to reach me is through the Canvas Inbox (Canvas messenger). Emails will be responded to
                within 24 hours of receipt.
              </p>
            </Section>

            <Section title="Semester schedule">
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-900">
                      <th scope="col" className="py-2 px-2 font-semibold">Weeks</th>
                      <th scope="col" className="py-2 px-2 font-semibold">Topic</th>
                      <th scope="col" className="py-2 px-2 font-semibold">Major graded work</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((row) => (
                      <tr key={row.weeks} className="border-b border-gray-100 align-top">
                        <td className="py-2 px-2 whitespace-nowrap">{row.weeks}</td>
                        <td className="py-2 px-2">{row.topic}</td>
                        <td className="py-2 px-2">{row.work}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-gray-500">Notice where DIVER shows up: it's graded work in week 1 and a review tool before each test.</p>
            </Section>

            <Section title="Grading">
              <p>
                Grading is points-based: your grade is total points earned ÷ total points possible. Letter grades:
                A ≥ 90% · B 80–89% · C 70–79% · D 60–69% · F below 60%. Check your grades in Canvas regularly and
                message me within a week if something looks off.
              </p>
            </Section>

            <Section title="Attendance & drop policy">
              <p>
                Attendance drives this class — in-class work is a large share of your grade. Complete the first-week
                orientation/check-in or you may be dropped for non-attendance. Repeated absence with no communication
                may result in being dropped.
              </p>
            </Section>

            <Section title="Academic integrity">
              <p>
                You are expected to follow the West Hills College Academic Honesty Policy: no cheating, no
                plagiarism, no unauthorized collaboration, no account sharing. Violations may result in disciplinary
                action.
              </p>
            </Section>

            <Section title="Accommodations">
              <p>
                If you have a verified need for academic accommodation or materials in alternate media per the ADA,
                contact me as soon as possible. The college's DSPS program is available to support you.
              </p>
            </Section>

            <Section title="Tech support">
              <p>WHCL Help Desk: westhillscollege.com/helpdesk, or the blue HELP link in Canvas for 24/7 support.</p>
            </Section>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Where DIVER came from</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            I built DIVER (and its opposite, FLOAT) to give students a way to use AI that still requires them to do
            the learning. I've since taught it to other educators, including the DIVER workshop I presented to
            California ag teachers at CATA 2026. The deck is public if you want to see how I teach it to faculty.
          </p>
          <a href={DIVER_DECK_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-indigo-700 hover:text-indigo-900">
            View the DIVER workshop deck (CATA 2026)
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-indigo-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Same teacher, same standards, applied to grading</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              I hold myself to the rule I give my students: AI drafts, a human verifies and owns the result. That's
              how Allen Grade Assist works in Canvas. It drafts feedback, and you review and approve every grade.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/canvas-setup">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto">Try Allen Grade Assist free</Button>
              </Link>
              <a href={ALLENASSIST_URL} target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">Want DIVER training for your department?</Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default InPractice;
