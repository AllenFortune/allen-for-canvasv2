import React, { useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PedagogyHero from "@/components/pedagogy/PedagogyHero";
import FeaturedArticle from "@/components/pedagogy/FeaturedArticle";
import ArticlesList from "@/components/pedagogy/ArticlesList";
import PedagogyNavigation from "@/components/pedagogy/PedagogyNavigation";
import { NotifyMeModal } from "@/components/pedagogy/NotifyMeModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowRight, ClipboardCheck, MessageCircle, FileText, Brain } from "lucide-react";
import { Link } from "react-router-dom";

const AIPedagogyHub = () => {
  const [gptModalOpen, setGptModalOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <PedagogyHero />
        
        {/* AI Literacy Tools Card */}
        <Card className="mb-8 border-l-4 border-l-indigo-600 bg-gradient-to-r from-indigo-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              Interactive AI Literacy Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Access our comprehensive suite of interactive AI literacy assessment tools, custom training modules, and advanced features designed for educators and institutions.
            </p>
            <Link to="/ai-literacy">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Access AI Literacy Tools
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* AI Literacy Builder Card */}
        <Card className="mb-12 border-l-4 border-l-emerald-600 bg-gradient-to-r from-emerald-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="w-6 h-6 text-emerald-600" />
              AI Literacy Builder for Assignments & Discussions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Transform your existing assignments and discussions using our DIVER framework (Discovery, Interaction, Verification, Editing, Reflection). Create student-focused AI prompts that encourage critical thinking, responsible AI use, and seamless Canvas integration.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">DIVER Framework Integration</h4>
                  <p className="text-sm text-gray-600">Structured approach to AI literacy in coursework</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Student-Focused Prompts</h4>
                  <p className="text-sm text-gray-600">Encourage critical thinking and responsible AI use</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Canvas Integration</h4>
                  <p className="text-sm text-gray-600">Seamlessly integrate with your existing LMS</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Assignment Transformation</h4>
                  <p className="text-sm text-gray-600">Modernize assignments and discussions effectively</p>
                </div>
              </div>
            </div>
            <Link to="/ai-assignment-integration">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Explore AI Literacy Builder
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* AI Syllabus Policy Builder Card */}
        <Card className="mb-12 border-l-4 border-l-blue-600 bg-gradient-to-r from-blue-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-6 h-6 text-blue-600" />
              AI Syllabus Policy Builder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Enhance your syllabus with comprehensive AI literacy policies and downloadable student use guides. Create customized academic integrity guidelines and responsible AI use frameworks tailored to your course.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Academic Integrity Policies</h4>
                  <p className="text-sm text-gray-600">Clear guidelines for AI use and academic honesty</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Student Use Guides</h4>
                  <p className="text-sm text-gray-600">Step-by-step tutorials for responsible AI integration</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Downloadable Resources</h4>
                  <p className="text-sm text-gray-600">PDF exports and Canvas-ready content modules</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Customizable Policies</h4>
                  <p className="text-sm text-gray-600">Tailored to your subject area and grade level</p>
                </div>
              </div>
            </div>
            <Link to="/ai-syllabus-builder">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Build Syllabus Policies
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* AI Rubric Builder Card */}
        <Card className="mb-12 border-l-4 border-l-violet-600 bg-gradient-to-r from-violet-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ClipboardCheck className="w-6 h-6 text-violet-600" />
              AI Rubric Builder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Automatically generate comprehensive assessment rubrics from your Canvas assignments or pasted content. Seamlessly integrates with the AI Literacy Builder to create aligned assessment criteria that evaluate both content mastery and responsible AI use.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-violet-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Automatic Generation</h4>
                  <p className="text-sm text-gray-600">Create rubrics from Canvas assignments or pasted descriptions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-violet-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">DIVER Framework Aligned</h4>
                  <p className="text-sm text-gray-600">Assessment criteria that match AI literacy components</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-violet-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Multiple Formats</h4>
                  <p className="text-sm text-gray-600">Analytic, holistic, and single-point rubric options</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-violet-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Canvas Integration</h4>
                  <p className="text-sm text-gray-600">Direct export to Canvas gradebook and SpeedGrader</p>
                </div>
              </div>
            </div>
            <Link to="/ai-rubric-builder">
              <Button className="bg-violet-600 hover:bg-violet-700">
                Build Rubric
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* CustomGPT Teaching Assistant Builder Card */}
        <Card className="mb-12 border-l-4 border-l-orange-600 bg-gradient-to-r from-orange-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MessageCircle className="w-6 h-6 text-orange-600" />
              CustomGPT Teaching Assistant Builder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Create personalized AI teaching assistants for your students with step-by-step guidance. Build GPTs that guide learning through Socratic questioning rather than providing direct answers, extending your office hours and supporting student understanding 24/7.
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Step-by-Step Setup</h4>
                  <p className="text-sm text-gray-600">Guided process to create your custom teaching assistant GPT</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Knowledge Base Integration</h4>
                  <p className="text-sm text-gray-600">Upload course materials and resources for contextual responses</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Socratic Learning Approach</h4>
                  <p className="text-sm text-gray-600">Guide students to answers through questions, not direct solutions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                <div>
                  <h4 className="font-semibold text-gray-900">Canvas Integration</h4>
                  <p className="text-sm text-gray-600">Add as external tool for seamless student access</p>
                </div>
              </div>
            </div>
            <Link to="/custom-gpt-builder">
              <Button className="bg-orange-600 hover:bg-orange-700">
                Create Teaching Assistant
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <div className="grid lg:grid-cols-4 gap-8 mt-12">
          <div className="lg:col-span-1">
            <PedagogyNavigation />
          </div>
          <div className="lg:col-span-3">
            <FeaturedArticle />
            <ArticlesList />
          </div>
        </div>
      </div>
      <Footer />
      
      {/* Notification Modals */}
      <NotifyMeModal
        open={gptModalOpen}
        onOpenChange={setGptModalOpen}
        featureName="CustomGPT Teaching Assistant Builder"
        featureDescription="Get notified when our step-by-step CustomGPT builder launches. Create personalized AI teaching assistants for your students."
      />
    </div>
  );
};

export default AIPedagogyHub;
