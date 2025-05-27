import React, { useState } from 'react';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Users, Shield, Lightbulb, FileText, Video, Award, Mail, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const AILiteracy = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup logic here
    console.log('Newsletter signup:', email);
    setEmail('');
    // You can add toast notification here
  };

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

  return (
    <ProtectedRoute>
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

            {/* Featured Resources */}
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

            {/* Resource Categories */}
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
                      <Link to={category.link}>
                        <Button variant="outline" className="w-full">
                          Explore {category.title}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Community Building Elements */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Stay Connected with AI Literacy Community
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Newsletter Signup */}
                <Card className="bg-indigo-50 border-indigo-200 flex flex-col h-full">
                  <CardContent className="p-8 flex flex-col h-full">
                    <div className="flex items-center mb-4">
                      <Mail className="w-8 h-8 text-indigo-600 mr-3" />
                      <h3 className="text-xl font-bold text-gray-900">Newsletter Signup</h3>
                    </div>
                    <p className="text-gray-600 mb-6 flex-grow">
                      Get the latest updates on AI literacy developments, new features, and best practices 
                      delivered straight to your inbox.
                    </p>
                    <form onSubmit={handleNewsletterSubmit} className="space-y-4 mt-auto">
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full"
                      />
                      <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                        Subscribe to Newsletter
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Webinar Registration */}
                <Card className="bg-indigo-50 border-indigo-200 flex flex-col h-full">
                  <CardContent className="p-8 flex flex-col h-full">
                    <div className="flex items-center mb-4">
                      <Calendar className="w-8 h-8 text-indigo-600 mr-3" />
                      <h3 className="text-xl font-bold text-gray-900">Upcoming Webinars</h3>
                    </div>
                    <p className="text-gray-600 mb-4 flex-grow">
                      Join our free sessions on AI literacy in education. Learn from experts and 
                      connect with fellow educators.
                    </p>
                    <div className="bg-white p-4 rounded-lg mb-4 border border-indigo-100">
                      <div className="text-sm font-medium text-indigo-600 mb-1">Next Session</div>
                      <div className="font-semibold text-gray-900 mb-1">
                        "Building AI Literacy: A Practical Approach"
                      </div>
                    </div>
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 mt-auto">
                      Register for Webinar
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AILiteracy;
