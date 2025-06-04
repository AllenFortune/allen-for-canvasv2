
import React, { useState } from 'react';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import AssignmentInputForm from "@/components/ai-assignment/AssignmentInputForm";
import DiverSuggestions from "@/components/ai-assignment/DiverSuggestions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookText, Lightbulb } from 'lucide-react';

interface DiverSuggestion {
  phase: string;
  title: string;
  description: string;
  activities: string[];
  examples: string[];
}

interface AssignmentIntegration {
  overview: string;
  suggestions: DiverSuggestion[];
  implementation_guide: string;
}

interface OriginalAssignment {
  title: string;
  content: string;
  subject?: string;
  gradeLevel?: string;
  estimatedTime?: string;
}

const AIAssignmentIntegration = () => {
  const [integration, setIntegration] = useState<AssignmentIntegration | null>(null);
  const [originalAssignment, setOriginalAssignment] = useState<OriginalAssignment | null>(null);
  const [loading, setLoading] = useState(false);

  const handleIntegrationGenerated = (result: AssignmentIntegration, assignmentData: OriginalAssignment) => {
    setIntegration(result);
    setOriginalAssignment(assignmentData);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-12">
          <div className="max-w-6xl mx-auto px-6">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-3">
                <BookText className="w-10 h-10 text-indigo-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">AI Literacy Assignment Integration Tool</h1>
              </div>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto">
                Transform your assignments with AI literacy integration using the proven DIVER framework. 
                Upload or paste your assignment content and receive personalized suggestions for enhancing 
                student learning with AI tools.
              </p>
            </div>

            {/* DIVER Framework Info */}
            <Card className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-indigo-900 text-lg">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  About the DIVER Framework
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-indigo-800 mb-3 text-sm">
                  The DIVER framework ensures AI enhances rather than replaces critical thinking through five key phases:
                </p>
                <div className="grid md:grid-cols-5 gap-3 text-xs">
                  <div className="text-center">
                    <div className="font-semibold text-indigo-900 mb-1">Discovery</div>
                    <div className="text-indigo-700">Exploration and multiple perspectives</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-indigo-900 mb-1">Interaction</div>
                    <div className="text-indigo-700">Collaborative learning and discussion</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-indigo-900 mb-1">Verification</div>
                    <div className="text-indigo-700">Critical evaluation and fact-checking</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-indigo-900 mb-1">Editing</div>
                    <div className="text-indigo-700">Iteration and personal ownership</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-indigo-900 mb-1">Reflection</div>
                    <div className="text-indigo-700">Metacognitive awareness and growth</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Input Section */}
              <div>
                <AssignmentInputForm 
                  onIntegrationGenerated={handleIntegrationGenerated}
                  loading={loading}
                  setLoading={setLoading}
                />
              </div>

              {/* Results Section */}
              <div>
                {integration ? (
                  <DiverSuggestions 
                    integration={integration} 
                    originalAssignment={originalAssignment}
                  />
                ) : (
                  <Card className="h-full flex items-center justify-center border-2 border-dashed border-gray-300">
                    <CardContent className="text-center py-8">
                      <BookText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Ready to Transform Your Assignment?
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Upload your assignment or paste the content to receive AI literacy integration suggestions 
                        based on the DIVER framework.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AIAssignmentIntegration;
