
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Brain, Users, Lightbulb, Search } from 'lucide-react';

const PedagogyNavigation = () => {
  const categories = [
    {
      icon: Brain,
      name: "Learning Theory",
      count: 1,
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Lightbulb,
      name: "Teaching Frameworks",
      count: 1,
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Users,
      name: "Classroom Management",
      count: 0,
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: BookOpen,
      name: "Assessment & Feedback",
      count: 0,
      color: "bg-orange-100 text-orange-600"
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Browse by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categories.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${category.color}`}>
                    <category.icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-gray-900">{category.name}</span>
                </div>
                <Badge variant="secondary">{category.count}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <a href="#featured" className="block text-indigo-600 hover:text-indigo-800 transition-colors">
              Featured Articles
            </a>
            <a href="#recent" className="block text-gray-600 hover:text-gray-800 transition-colors">
              Recently Added
            </a>
            <a href="#popular" className="block text-gray-600 hover:text-gray-800 transition-colors">
              Most Popular
            </a>
            <a href="#frameworks" className="block text-gray-600 hover:text-gray-800 transition-colors">
              Teaching Frameworks
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PedagogyNavigation;
