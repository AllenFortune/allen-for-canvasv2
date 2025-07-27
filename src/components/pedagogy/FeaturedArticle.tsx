import React, { useState } from 'react';
import { Clock, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { articles } from '@/data/articles';
import ArticleContent from './ArticleContent';
import DiverFrameworkArticle from './DiverFrameworkArticle';
import AssessmentArticle from './AssessmentArticle';
import PromptEngineeringArticle from './PromptEngineeringArticle';
import DigitalCitizenshipArticle from './DigitalCitizenshipArticle';
import AIAssistedAssessmentArticle from './AIAssistedAssessmentArticle';

const FeaturedArticle = () => {
  const [showFullArticle, setShowFullArticle] = useState<string | null>(null);

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

  if (showFullArticle === 'digital-citizenship') {
    return <DigitalCitizenshipArticle onBack={() => setShowFullArticle(null)} />;
  }

  if (showFullArticle === 'ai-assisted-assessment') {
    return <AIAssistedAssessmentArticle onBack={() => setShowFullArticle(null)} />;
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
