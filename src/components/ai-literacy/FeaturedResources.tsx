
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, FileText, Award } from 'lucide-react';

const FeaturedResources = () => {
  const featuredResources = [{
    title: "Getting Started with AI in Education",
    type: "Video Series",
    duration: "45 min",
    icon: Video,
    description: "A comprehensive introduction to integrating AI tools in your Canvas classroom"
  }, {
    title: "AI Literacy Assessment Rubric",
    type: "Download",
    format: "PDF",
    icon: FileText,
    description: "Ready-to-use rubric for evaluating student AI collaboration skills"
  }, {
    title: "Educator AI Certification",
    type: "Course",
    duration: "4 weeks",
    icon: Award,
    description: "Become a certified AI-literate educator with our comprehensive program"
  }];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Resources</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {featuredResources.map((resource, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow flex flex-col h-full">
            <CardHeader>
              <div className="flex items-center mb-2">
                <resource.icon className="w-6 h-6 text-indigo-600 mr-2" />
                <span className="text-sm font-medium text-indigo-600">{resource.type}</span>
                {resource.duration && <span className="text-sm text-gray-500 ml-auto">{resource.duration}</span>}
                {resource.format && <span className="text-sm text-gray-500 ml-auto">{resource.format}</span>}
              </div>
              <CardTitle className="text-lg">{resource.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <p className="text-gray-600 mb-4 flex-grow">{resource.description}</p>
              <Button className="w-full mt-auto">Coming Soon</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeaturedResources;
