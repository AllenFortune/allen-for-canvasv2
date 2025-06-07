
import React, { useState } from 'react';
import { Clock, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ArticleContent from './ArticleContent';
import DiverFrameworkArticle from './DiverFrameworkArticle';
import AssessmentArticle from './AssessmentArticle';
import PromptEngineeringArticle from './PromptEngineeringArticle';

const FeaturedArticle = () => {
  const [showFullArticle, setShowFullArticle] = useState<string | null>(null);

  const articles = [
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
    }
  ];

  if (showFullArticle === 'cognitive-load') {
    return <ArticleContent onBack={() => setShowFullArticle(null)} />;
  }

  if (showFullArticle === 'diver-framework') {
    return <DiverFrameworkArticle onBack={() => setShowFullArticle(null)} />;
  }

  if (showFullArticle === 'assessment-ai') {
    return <AssessmentArticle onBack={() => setShowFullArticle(null)} />;
  }

  if (showFullArticle === 'prompt-engineering') {
    return <PromptEngineeringArticle onBack={() => setShowFullArticle(null)} />;
  }

  return (
    <div className="space-y-8">
      {articles.map((article, index) => (
        <Card key={article.id} className="border-l-4 border-l-indigo-600">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default" className="bg-indigo-600">Featured Article</Badge>
              <Badge variant="outline">{article.category}</Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
              {article.title}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{article.readTime}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed mb-6">
              {article.excerpt}
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {article.tags.map((tag, tagIndex) => (
                <div key={tagIndex} className="flex items-center gap-1 text-sm text-gray-600">
                  <Tag className="w-3 h-3" />
                  <span>{tag}</span>
                </div>
              ))}
            </div>
            <Button 
              onClick={() => setShowFullArticle(article.id)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Read Full Article
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FeaturedArticle;
