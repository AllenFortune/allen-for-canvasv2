
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Plus } from 'lucide-react';

const ArticlesList = () => {
  const comingSoonArticles = [
    {
      title: "AI-Assisted Assessment: Beyond Auto-Grading",
      excerpt: "Explore innovative ways to use AI for formative assessment and meaningful feedback generation.",
      category: "Assessment & Feedback",
      readTime: "8 min read",
      comingSoon: true
    }
  ];

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">More Articles</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {comingSoonArticles.map((article, index) => (
          <Card key={index} className="relative opacity-75">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">{article.category}</Badge>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Coming Soon
                </Badge>
              </div>
              <CardTitle className="text-lg leading-tight">
                {article.title}
              </CardTitle>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{article.readTime}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                {article.excerpt}
              </p>
            </CardContent>
            <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
              <div className="text-center">
                <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-600">Coming Soon</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      <div className="text-center mt-8 p-8 bg-indigo-50 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          More Content Coming Soon
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We're continuously developing new resources to help educators integrate AI effectively in their classrooms. 
          Check back regularly for new articles, case studies, and practical guides.
        </p>
      </div>
    </div>
  );
};

export default ArticlesList;
