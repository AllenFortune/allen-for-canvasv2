
import React, { useState } from 'react';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import AssignmentInputForm from "@/components/ai-assignment/AssignmentInputForm";
import DiverSuggestions from "@/components/ai-assignment/DiverSuggestions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { BookText, Lightbulb, ChevronDown, ChevronRight } from 'lucide-react';

interface DiverSuggestion {
  phase: string;
  title: string;
  description: string;
  activities: string[];
  examples: string[];
  studentAIPrompts: string[];
  teachingTips: string[];
  criticalThinkingQuestions: string[];
  responsibleUseGuideline: string;
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
  const [showDiverInfo, setShowDiverInfo] = useState(false);

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
              <div className="flex items-center justify-center mb-4">
                <BookText className="w-8 h-8 text-primary mr-3" />
                <h1 className="text-3xl font-bold text-foreground">AI Assignment Integration</h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Transform your assignments with AI literacy integration using the DIVER framework. Get student-focused AI prompts that encourage critical thinking and responsible AI use.
              </p>
            </div>

            {/* Collapsible DIVER Framework Info */}
            <div className="mb-8">
              <Collapsible open={showDiverInfo} onOpenChange={setShowDiverInfo}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="mx-auto flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    About the DIVER Framework
                    {showDiverInfo ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <Card className="max-w-4xl mx-auto">
                    <CardContent className="pt-6">
                      <p className="text-muted-foreground mb-4 text-center">
                        The DIVER framework ensures AI enhances rather than replaces critical thinking through five key phases:
                      </p>
                      <div className="grid md:grid-cols-5 gap-4 text-sm">
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <div className="font-semibold text-foreground mb-1">Discovery</div>
                          <div className="text-muted-foreground">Exploration and multiple perspectives</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <div className="font-semibold text-foreground mb-1">Interaction</div>
                          <div className="text-muted-foreground">Collaborative learning and discussion</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <div className="font-semibold text-foreground mb-1">Verification</div>
                          <div className="text-muted-foreground">Critical evaluation and fact-checking</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <div className="font-semibold text-foreground mb-1">Editing</div>
                          <div className="text-muted-foreground">Iteration and personal ownership</div>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-muted/50">
                          <div className="font-semibold text-foreground mb-1">Reflection</div>
                          <div className="text-muted-foreground">Metacognitive awareness and growth</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Main Content - Improved container with better overflow handling */}
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Input Section - Removed height constraints */}
              <div className="w-full">
                <AssignmentInputForm 
                  onIntegrationGenerated={handleIntegrationGenerated}
                  loading={loading}
                  setLoading={setLoading}
                />
              </div>

              {/* Results Section */}
              {integration && (
                <div className="w-full">
                  <DiverSuggestions 
                    integration={integration} 
                    originalAssignment={originalAssignment}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AIAssignmentIntegration;
