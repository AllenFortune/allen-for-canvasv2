
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ArticleHeader from './diver/ArticleHeader';
import ArticleImage from './diver/ArticleImage';
import FrameworkOverview from './diver/FrameworkOverview';
import FrameworkComponents from './diver/FrameworkComponents';
import ImplementationSection from './diver/ImplementationSection';
import SubjectApplications from './diver/SubjectApplications';
import ArticleFooter from './diver/ArticleFooter';

interface DiverFrameworkArticleProps {
  onBack: () => void;
}

const DiverFrameworkArticle = ({ onBack }: DiverFrameworkArticleProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      <ArticleHeader onBack={onBack} />

      <Card>
        <CardContent className="p-8">
          <div className="prose prose-lg max-w-none">
            <FrameworkOverview />
            <ArticleImage />
            <FrameworkComponents />
            <ImplementationSection />
            <SubjectApplications />
            <ArticleFooter />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiverFrameworkArticle;
