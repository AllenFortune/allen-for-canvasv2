
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen } from 'lucide-react';

const ArticlesList = () => {
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">More Articles</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-dashed border-2 border-gray-300">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
            <CardTitle className="text-lg text-gray-700">
              More Articles Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 leading-relaxed">
              We're continuously developing new resources to help educators integrate AI effectively in their classrooms.
            </p>
          </CardContent>
        </Card>
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
