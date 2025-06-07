
import React from 'react';
import { ArrowLeft, Clock, User, Printer, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ArticleHeaderProps {
  onBack: () => void;
}

const ArticleHeader = ({ onBack }: ArticleHeaderProps) => {
  return (
    <div className="mb-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Hub
      </Button>
      
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="default" className="bg-green-600">Best Practices</Badge>
        <Badge variant="outline">Teaching Frameworks</Badge>
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        The ALLEN D.I.V.E.R. Framework: A Complete Guide to AI-Enhanced Learning
      </h1>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>A.L.L.E.N. Educational Team</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>10 min read</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ArticleHeader;
