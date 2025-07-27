export interface Article {
  id: string;
  title: string;
  excerpt: string;
  readTime: string;
  author: string;
  category: string;
  tags: string[];
  featured: boolean;
}

export const articles: Article[] = [
  {
    id: 'cognitive-load',
    title: "Cognitive Load Theory & AI: Balancing Mental Effort in the Digital Classroom",
    excerpt: "In today's rapidly evolving educational landscape, teachers face the dual challenge of integrating new technologies while ensuring students aren't overwhelmed. Artificial intelligence (AI) tools offer exciting possibilities for education, but their effectiveness depends on how well they align with how our brains actually process information.",
    readTime: "8 min read",
    author: "A.L.L.E.N. Educational Team",
    category: "Learning Theory",
    tags: ["Cognitive Load", "AI Implementation", "Classroom Management"],
    featured: true
  },
  {
    id: 'diver-framework',
    title: "The ALLEN D.I.V.E.R. Framework: A Complete Guide to AI-Enhanced Learning",
    excerpt: "Discover our signature framework for integrating AI into classroom learning experiences. The D.I.V.E.R. approach ensures students engage in meaningful learning while leveraging AI as a powerful educational tool rather than a shortcut to answers.",
    readTime: "10 min read",
    author: "A.L.L.E.N. Educational Team",
    category: "Teaching Frameworks",
    tags: ["D.I.V.E.R. Framework", "Best Practices", "AI Integration"],
    featured: true
  },
  {
    id: 'assessment-ai',
    title: "Rethinking Assessment in the Age of AI: From Product to Process",
    excerpt: "In an era where artificial intelligence can generate essays, solve complex problems, and even simulate human conversation, traditional assessment methods are facing unprecedented challenges. The ease with which students can utilize AI tools to produce polished assignments calls into question the efficacy of evaluating solely the final product.",
    readTime: "12 min read",
    author: "A.L.L.E.N. Educational Team",
    category: "Assessment & Feedback",
    tags: ["AI Integration", "Assessment Methods", "Process Evaluation", "Academic Integrity"],
    featured: true
  },
  {
    id: 'prompt-engineering',
    title: "Prompt Engineering for Educators: Crafting Effective AI Conversations",
    excerpt: "In today's AI-enhanced classroom, the quality of information you receive from AI tools depends largely on the quality of your prompts. Just as a well-crafted question leads students to deeper thinking, a skillfully engineered prompt guides AI toward more useful, accurate, and educationally valuable responses.",
    readTime: "6 min read",
    author: "A.L.L.E.N. Educational Team",
    category: "AI Implementation",
    tags: ["Prompt Engineering", "AI Implementation", "Teaching Strategies", "Digital Literacy"],
    featured: true
  },
  {
    id: 'digital-citizenship',
    title: "Building Digital Citizenship in the AI Era",
    excerpt: "In today's classrooms, digital citizenship has evolved far beyond teaching students to create strong passwords and avoid sharing personal information online. With artificial intelligence now embedded in students' daily digital experiences, educators face a critical new dimension of digital citizenship education.",
    readTime: "7 min read",
    author: "A.L.L.E.N. Educational Team",
    category: "Digital Citizenship",
    tags: ["Digital Citizenship", "AI Literacy", "Ethics", "Critical Thinking"],
    featured: true
  },
  {
    id: 'ai-assisted-assessment',
    title: "AI-Assisted Assessment: Beyond Auto-Grading",
    excerpt: "In the evolving landscape of educational technology, AI-assisted assessment has emerged as a powerful tool with potential far beyond simply automating the grading process. While auto-grading multiple-choice questions has been around for decades, today's AI tools offer sophisticated capabilities that can transform how we approach student feedback, formative assessment, and the entire evaluation process.",
    readTime: "8 min read",
    author: "A.L.L.E.N. Educational Team",
    category: "Assessment & Feedback",
    tags: ["AI Integration", "Assessment Methods", "Formative Assessment", "Educational Technology"],
    featured: true
  }
];