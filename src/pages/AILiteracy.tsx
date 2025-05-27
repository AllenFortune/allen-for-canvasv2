import React from 'react';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Shield, Lightbulb, FileText, Video, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
const AILiteracy = () => {
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
  return <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                AI Literacy Resource Center
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Transform your teaching with AI literacy resources designed to help students learn 
                WITH artificial intelligence, not despite it. Build critical thinking, creativity, 
                and collaboration skills for the AI-enhanced future.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6 mb-12">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">50+</div>
                  <div className="text-sm text-gray-600">Research Articles</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">25+</div>
                  <div className="text-sm text-gray-600">Assignment Templates</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">12</div>
                  <div className="text-sm text-gray-600">Ethics Modules</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">100+</div>
                  <div className="text-sm text-gray-600">Success Stories</div>
                </CardContent>
              </Card>
            </div>

            {/* Featured Resources */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Resources</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {featuredResources.map((resource, index) => <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center mb-2">
                        <resource.icon className="w-6 h-6 text-indigo-600 mr-2" />
                        <span className="text-sm font-medium text-indigo-600">{resource.type}</span>
                        {resource.duration && <span className="text-sm text-gray-500 ml-auto">{resource.duration}</span>}
                        {resource.format && <span className="text-sm text-gray-500 ml-auto">{resource.format}</span>}
                      </div>
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{resource.description}</p>
                      <Button className="w-full">Coming Soon</Button>
                    </CardContent>
                  </Card>)}
              </div>
            </div>

            {/* Resource Categories */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Explore by Category</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {resourceCategories.map((category, index) => <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center mb-2">
                        <category.icon className="w-8 h-8 text-indigo-600 mr-3" />
                        <CardTitle className="text-xl">{category.title}</CardTitle>
                      </div>
                      <p className="text-gray-600">{category.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        {category.items.map((item, itemIndex) => <div key={itemIndex} className="flex items-center text-sm text-gray-700">
                            <div className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></div>
                            {item}
                          </div>)}
                      </div>
                      <Link to={category.link}>
                        <Button variant="outline" className="w-full">
                          Explore {category.title}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>)}
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-12 text-center">
              <Card className="bg-indigo-50 border-indigo-200">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Ready to Transform Your Teaching?
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Join thousands of educators who are already integrating AI literacy into their 
                    Canvas classrooms. Start with our quick setup guide and see immediate results.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                      Start Quick Setup
                    </Button>
                    <Button variant="outline" size="lg">
                      Schedule Demo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>;
};
export default AILiteracy;