
import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  CheckCircle, 
  Clock, 
  Shield, 
  BarChart3, 
  BookOpen, 
  Users, 
  Lightbulb,
  GraduationCap,
  FileText,
  User
} from 'lucide-react';

const Features = () => {
  const navigate = useNavigate();

  const currentFeatures = [
    {
      icon: <CheckCircle className="w-8 h-8 text-indigo-600" />,
      title: "AI-Enhanced Grading",
      description: "Intelligent assignment and discussion grading with rubric integration. Save 60% of your grading time while maintaining quality feedback.",
      features: ["Assignment grading automation", "Discussion post evaluation", "Rubric-based assessment", "Consistent feedback generation"]
    },
    {
      icon: <FileText className="w-8 h-8 text-indigo-600" />,
      title: "Canvas Integration",
      description: "Seamless connection with your Canvas LMS for streamlined workflow and automatic grade passback.",
      features: ["Secure API connection", "Real-time submission sync", "Automatic grade passback", "Course management"]
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-indigo-600" />,
      title: "Teacher Dashboard",
      description: "Comprehensive overview of your courses, assignments, and grading progress in one centralized location.",
      features: ["Assignment overview", "Course filtering", "Progress tracking", "Quick grading access"]
    },
    {
      icon: <Shield className="w-8 h-8 text-indigo-600" />,
      title: "Security & Privacy",
      description: "Enterprise-grade security with encrypted data handling and no permanent storage of student work.",
      features: ["Data encryption", "Secure authentication", "Privacy protection", "Temporary data handling"]
    }
  ];

  const futureFeatures = [
    {
      icon: <User className="w-8 h-8 text-indigo-600" />,
      title: "Student AI Literacy Dashboard",
      description: "Help students develop AI literacy alongside content mastery with comprehensive tracking and reflection tools.",
      features: [
        "AI Usage Tracking with improvement suggestions",
        "Reflection Prompts for critical thinking about AI interactions", 
        "AI Ethics Badges for gamified responsible AI learning",
        "Peer Collaboration Tools for sharing AI-assisted work"
      ]
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-indigo-600" />,
      title: "Advanced Grading for AI-Integrated Work",
      description: "Enhanced grading capabilities specifically designed to evaluate AI-assisted submissions effectively.",
      features: [
        "AI Collaboration Assessment evaluating how well students worked WITH AI",
        "Process Documentation tools for showing thinking processes",
        "Iterative Feedback Loops for multi-stage assignment grading",
        "Metacognitive Assessment rubrics for AI-assisted learning evaluation"
      ]
    },
    {
      icon: <GraduationCap className="w-8 h-8 text-indigo-600" />,
      title: "Professional Development Platform",
      description: "Comprehensive support for teachers in their AI literacy journey with structured learning paths.",
      features: [
        "Microlearning Modules on AI integration techniques",
        "Virtual Workshops with live AI literacy sessions",
        "Teacher Community forums for sharing successes and challenges",
        "Certification Pathways for becoming an 'AI-Literate Educator'"
      ]
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-indigo-600" />,
      title: "Analytics & Insights Enhancement",
      description: "Deep insights into AI-enhanced learning with comprehensive analytics and growth tracking.",
      features: [
        "Learning Style Analysis with AI-powered insights",
        "AI Tool Effectiveness Metrics for different learning objectives",
        "Class AI Readiness Assessment for current literacy levels",
        "Growth Tracking for monitoring AI collaboration skill development"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Features That Transform Teaching
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Discover how A.L.L.E.N. revolutionizes grading and prepares students for an AI-enhanced future. 
            From current AI-powered grading to upcoming AI literacy tools.
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              size="lg" 
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => navigate("/canvas-setup")}
            >
              Start Free Trial
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate("/ai-literacy")}
            >
              Explore AI Literacy
            </Button>
          </div>
        </div>
      </section>

      {/* Current Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-green-100 text-green-800 border-green-200 mb-4">
              Live Now
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Current Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              AI-powered tools that are transforming classrooms today
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {currentFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    {feature.icon}
                    <CardTitle className="text-xl ml-3">{feature.title}</CardTitle>
                  </div>
                  <p className="text-gray-600">{feature.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center text-sm text-gray-700">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Future Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 mb-4">
              Coming Soon
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              The Future of AI-Literate Education
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Revolutionary features designed to prepare students for an AI-enhanced world
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {futureFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow h-full border-2 border-indigo-100">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {feature.icon}
                      <CardTitle className="text-xl ml-3">{feature.title}</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-indigo-600 border-indigo-600">
                      Coming Soon
                    </Badge>
                  </div>
                  <p className="text-gray-600">{feature.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.features.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center text-sm text-gray-700">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Teaching?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join educators who are already saving time with AI-enhanced grading while preparing students for the future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-indigo-600 hover:bg-gray-100"
              onClick={() => navigate("/canvas-setup")}
            >
              Start Free Trial
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-indigo-600"
              onClick={() => navigate("/pricing")}
            >
              View Pricing
            </Button>
          </div>
          <p className="text-indigo-200 text-sm mt-4">
            No credit card required • 10 free submissions
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;
