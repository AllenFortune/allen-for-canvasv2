import React from 'react';
import { Link } from "react-router-dom";
import ArticleLayout from "@/components/blog/ArticleLayout";

const Figure = ({ src, alt, caption }: { src: string; alt: string; caption: string }) => (
  <figure className="my-8">
    <img src={src} alt={alt} loading="lazy" className="rounded-lg border border-gray-200 shadow-sm w-full" />
    <figcaption className="text-sm text-gray-500 mt-2 text-center">{caption}</figcaption>
  </figure>
);

const HowIGraded3782Submissions = () => (
  <ArticleLayout
    title="How I Graded 3,782 Submissions Last Semester (and What the AI Still Gets Wrong)"
    description="A full-time psychology professor's honest account of AI-assisted grading in Canvas: real numbers from one semester, the early failures, and why the instructor still decides every grade."
    path="/blog/how-i-graded-3782-submissions-with-ai"
    datePublished="2026-07-07"
  >
    <p>
      Last spring I taught three sections of Introduction to Psychology at Lemoore College —
      about 98 students. My Canvas records for the semester show <strong>3,782 graded
      submissions</strong>: 2,047 assignments, 1,183 discussion posts, and 552 quiz
      responses. Along the way I left <strong>2,183 written feedback comments averaging
      161 words each</strong> — roughly 350,000 words of individualized feedback in
      sixteen weeks.
    </p>
    <p>
      I didn't type most of those words. I built Allen Grade Assist, and I grade every one
      of my courses with it. This is an honest account of what that actually looks like —
      including the parts where the AI got it wrong, and the parts where it still does.
    </p>
    <p>
      Before the tool, feedback at that volume simply didn't happen. Nobody hand-writes
      161 words per student across two thousand comments — you triage. Strong students got
      "Great work!", struggling students got a rushed paragraph, and everyone in the middle
      got whatever energy I had left at 10 p.m. The honest comparison isn't "AI feedback
      versus my best feedback." It's AI-drafted feedback I reviewed and edited, versus the
      thin feedback students actually get from an instructor grading hundreds of
      submissions a week without help.
    </p>

    <h2>What a grading session actually looks like</h2>
    <p>
      The workflow is the same for every submission: the tool pulls the student's work from
      Canvas, drafts feedback and a suggested score against my criteria, and waits. I read
      the draft next to the submission, edit or override, and only then does anything post
      back to the Canvas gradebook.
    </p>
    <Figure
      src="/blog/submission-review.png"
      alt="Allen Grade Assist grading view showing a submission and drafted feedback side by side"
      caption="The submission and the drafted feedback sit side by side. Nothing posts to Canvas until I approve it. (Screenshots are from a professional-development course I run for fellow instructors — no student work is shown.)"
    />
    <p>
      My biggest sitting last semester, according to the timestamps: a Sunday in early
      March, <strong>367 submissions in about four hours</strong>. That pace — roughly 90
      an hour — includes reading each draft, checking it against the submission, and
      editing where the AI missed my emphasis. I still grade on Sunday mornings. The
      difference is what I get through before lunch.
    </p>

    <h2>The early misses — and what they taught me</h2>
    <p>
      When I first started building, the misses were frequent. The most common failure
      wasn't a wrong score — it was <em>generic feedback</em>. The AI would produce
      paragraphs that were accurate but interchangeable: they could have been pasted under
      any student's post. Feedback like that is worse than useless; students can tell
      instantly that nobody read their work.
    </p>
    <p>
      I found myself typing the same corrective prompts over and over: <em>use specific
      examples from this student's submission; quote what they actually said; make sure
      the student knows exactly what to improve.</em> If I didn't, the drafts drifted back
      toward boilerplate.
    </p>
    <p>
      The second miss surprised me more: <strong>the AI was a much tougher grader than I
      am.</strong> Left alone, it docked points the way a rubric-maximalist TA would —
      technically defensible, but not how I grade. I grade generously on effort and
      substance because my goal in an intro course is to keep students writing, not to
      punish them for imperfect citations. The AI didn't know that. Score after score came
      back lower than what I would have given, and I was overriding constantly.
    </p>

    <h2>The fix: teach it your grading style, once</h2>
    <p>
      Those two failures became a feature. I added saved custom grading instructions —
      a place to write down, once, the corrections I kept typing: use the student's own
      examples, keep the tone casual, grade generously, skip the point-by-point breakdown.
      Now that preset loads with one click at the start of a session, and the drafts come
      back sounding a lot more like me.
    </p>
    <Figure
      src="/blog/custom-grading-instructions.png"
      alt="Custom grading instructions panel with a saved preset loaded"
      caption="My actual saved preset. This is the accumulated list of corrections I used to type by hand — now it rides along on every AI draft."
    />
    <p>
      This is the single biggest lesson from two years of grading with AI: <strong>the
      out-of-the-box model is not your grader.</strong> It doesn't know you grade
      generously, or that you don't count late penalties on discussions, or that "cite the
      textbook" matters less to you than "apply the concept." Until you tell it — in
      writing, persistently — it will grade like a stranger. (This is also why a
      well-written rubric matters so much; I wrote a separate guide on{" "}
      <Link to="/blog/rubric-design-for-ai-grading">designing rubrics that work with AI
      grading</Link>.)
    </p>

    <h2>What I still do on every single submission</h2>
    <p>
      I review every draft before it posts. That's not a compliance line — it's where the
      remaining misses get caught. The AI Grade Review summary tells me what the model
      thought it was doing, which makes bad drafts fast to spot.
    </p>
    <Figure
      src="/blog/ai-draft-feedback.png"
      alt="AI-drafted feedback with suggested score and the teacher-only AI Grade Review panel"
      caption="The draft, the suggested score, and the teacher-only 'AI Grade Review' explaining the reasoning. If the reasoning is off, I catch it here — before the student ever sees anything."
    />
    <p>
      I also add specifics. I don't try to trick my students into thinking I hand-wrote
      every word of every comment — my syllabus says AI assists with feedback and that I
      review and own every grade. But when an assignment has something I want to emphasize
      — a concept half the class is fumbling, a connection to next week's material — I add
      it to the draft myself. The AI gives me the 161-word floor. The parts that are
      distinctly <em>mine</em> go on top.
    </p>
    <p>What the AI still gets wrong, even now:</p>
    <ul>
      <li>
        <strong>Unusual-but-valid arguments.</strong> A student who takes a defensible
        position the rubric didn't anticipate will get feedback that misses the point.
        That's an override.
      </li>
      <li>
        <strong>Context the platform can't see.</strong> "This is a huge improvement for
        this student" is a judgment only I can make, because only I watched the first
        six weeks.
      </li>
      <li>
        <strong>Severity calibration on edge cases.</strong> It's better than it was, but
        on genuinely borderline work I still trust my read over the suggested score.
      </li>
    </ul>

    <h2>The honest math</h2>
    <p>
      I won't invent a minutes-saved number — I didn't run a stopwatch on my pre-AI
      grading. Here's what I can say from the records: 3,782 submissions graded across
      three sections in one semester, 350,000 words of feedback delivered, no TA, and a
      March peak of over 1,000 submissions in a single month that did not eat a single
      full weekend. In the semesters before, discussion boards alone routinely did.
    </p>
    <p>
      If you teach with Canvas and your evenings look like mine used to,{" "}
      <Link to="/canvas-ai-grading">this is what the tool does</Link>, and the{" "}
      <Link to="/pricing">free trial is 10 submissions</Link> — about one discussion
      board's worth. Bring a real stack and see whether the drafts sound like you after
      you've told it how you grade. Mine didn't at first. That's the part nobody selling
      you AI grading will say out loud.
    </p>
  </ArticleLayout>
);

export default HowIGraded3782Submissions;
