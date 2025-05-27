
import React, { useState } from 'react';
import { Clock, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ArticleContent from './ArticleContent';

const FeaturedArticle = () => {
  const [showFullArticle, setShowFullArticle] = useState(false);

  const article = {
    title: "Cognitive Load Theory & AI: Balancing Mental Effort in the Digital Classroom",
    excerpt: "In today's rapidly evolving educational landscape, teachers face the dual challenge of integrating new technologies while ensuring students aren't overwhelmed. Artificial intelligence (AI) tools offer exciting possibilities for education, but their effectiveness depends on how well they align with how our brains actually process information.",
    readTime: "8 min read",
    author: "A.L.L.E.N. Educational Team",
    category: "Learning Theory",
    tags: ["Cognitive Load", "AI Implementation", "Classroom Management"],
    featured: true
  };

  if (showFullArticle) {
    return <ArticleContent onBack={() => setShowFullArticle(false)} />;
  }

  return (
    <Card className="mb-8 border-l-4 border-l-indigo-600">
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
          {article.tags.map((tag, index) => (
            <div key={index} className="flex items-center gap-1 text-sm text-gray-600">
              <Tag className="w-3 h-3" />
              <span>{tag}</span>
            </div>
          ))}
        </div>
        <Button 
          onClick={() => setShowFullArticle(true)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Read Full Article
        </Button>
      </CardContent>
    </Card>
  );
};

export default FeaturedArticle;
