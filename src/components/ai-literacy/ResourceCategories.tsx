
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Shield, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

const ResourceCategories = () => {
  const resourceCategories = [{
    title: "AI Pedagogy Hub",
    icon: BookOpen,
    description: "Research-backed articles on effective AI integration in learning",
    items: ["Cognitive Load Theory & AI", "Scaffolding with AI Tools", "Assessment in AI-Enhanced Learning"],
    link: "/ai-literacy/pedagogy"
  }, {
    title: "Assignment Design Templates",
    icon: FileText,
    description: "Pre-built assignment frameworks that encourage productive AI use",
    items: ["AI-Assisted Research Projects", "Critical Thinking with AI", "Creative Writing Collaborations"],
    link: "/ai-literacy/templates"
  }, {
    title: "AI Ethics Curriculum",
    icon: Shield,
    description: "Modules on responsible AI use, bias awareness, and critical thinking",
    items: ["Understanding AI Bias", "Academic Integrity in AI Era", "Privacy & Data Ethics"],
    link: "/ai-literacy/ethics"
  }, {
    title: "Best Practices Library",
    icon: Lightbulb,
    description: "Case studies from successful AI-integrated classrooms",
    items: ["Elementary AI Integration", "High School Success Stories", "University Case Studies"],
    link: "/ai-literacy/best-practices"
  }];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore by Category</h2>
      <div className="grid md:grid-cols-2 gap-8">
        {resourceCategories.map((category, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center mb-2">
                <category.icon className="w-8 h-8 text-indigo-600 mr-3" />
                <CardTitle className="text-xl">{category.title}</CardTitle>
              </div>
              <p className="text-gray-600">{category.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center text-sm text-gray-700">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></div>
                    {item}
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full">
                Coming Fall 2025
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ResourceCategories;
