import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProtectedRoute from '@/components/ProtectedRoute';
import { CustomGPTBuilderWizard } from '@/components/custom-gpt/CustomGPTBuilderWizard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, BookOpen, Users, Zap } from 'lucide-react';

const CustomGPTBuilder: React.FC = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 pb-8 pt-20">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">CustomGPT Teaching Assistant Builder</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Create personalized AI teaching assistants for your students with step-by-step guidance. 
              Build GPTs that guide learning through Socratic questioning rather than providing direct answers.
            </p>
          </div>

          {/* Feature Overview Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card>
              <CardHeader className="text-center pb-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Step-by-Step Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Guided process to create your custom teaching assistant GPT
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center pb-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Knowledge Base</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Upload course materials and resources for contextual responses
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center pb-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Socratic Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Guide students to answers through questions, not direct solutions
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center pb-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Canvas Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Add as external tool for seamless student access
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Main Wizard */}
          <CustomGPTBuilderWizard />
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default CustomGPTBuilder;