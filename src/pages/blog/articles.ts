export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  datePublished: string;
  readingTime: string;
}

/** Registry for /blog index + sitemap upkeep. Newest first. */
export const articles: ArticleMeta[] = [
  {
    slug: "how-i-graded-3782-submissions-with-ai",
    title: "How I Graded 3,782 Submissions Last Semester (and What the AI Still Gets Wrong)",
    description:
      "A full-time psychology professor's honest account of AI-assisted grading in Canvas: real numbers from one semester, the early failures, and why the instructor still decides every grade.",
    datePublished: "2026-07-07",
    readingTime: "8 min read",
  },
  {
    slug: "rubric-design-for-ai-grading",
    title: "How to Design a Rubric That Works With AI-Assisted Grading",
    description:
      "A working professor's guide to writing rubrics that produce consistent, defensible AI-drafted feedback in Canvas — criteria that work, criteria that fail, and a discussion-board template to adapt.",
    datePublished: "2026-07-07",
    readingTime: "9 min read",
  },
];
