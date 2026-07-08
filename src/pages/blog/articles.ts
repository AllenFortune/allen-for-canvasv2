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
    slug: "rubric-design-for-ai-grading",
    title: "How to Design a Rubric That Works With AI-Assisted Grading",
    description:
      "A working professor's guide to writing rubrics that produce consistent, defensible AI-drafted feedback in Canvas — criteria that work, criteria that fail, and a discussion-board template to adapt.",
    datePublished: "2026-07-07",
    readingTime: "9 min read",
  },
];
