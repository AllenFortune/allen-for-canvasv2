import React, { useState } from 'react';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import SyllabusBuilderWizard from "@/components/syllabus-builder/SyllabusBuilderWizard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { FileText, Lightbulb, ChevronDown, ChevronRight, Shield, BookOpen, Download } from 'lucide-react';

const AISyllabusBuilder = () => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-12">
          <div className="max-w-6xl mx-auto px-6">
            {/* Header Section */}
            <div className="text-center mb-8 pt-16">
              <div className="flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-primary mr-3" />
                <h1 className="text-3xl font-bold text-foreground">AI Syllabus Policy Builder</h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Enhance your syllabus with comprehensive AI literacy policies and student use guides. Create downloadable resources that promote responsible AI integration in your course.
              </p>
            </div>

            {/* Collapsible Info */}
            <div className="mb-8">
              <Collapsible open={showInfo} onOpenChange={setShowInfo}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="mx-auto flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    What This Tool Creates
                    {showInfo ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <Card className="max-w-4xl mx-auto">
                    <CardContent className="pt-6">
                      <div className="grid md:grid-cols-3 gap-6 text-sm">
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                          <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                          <div className="font-semibold text-foreground mb-2">AI Use Policies</div>
                          <div className="text-muted-foreground">Academic integrity guidelines, permitted uses, and citation requirements tailored to your course</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                          <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
                          <div className="font-semibold text-foreground mb-2">Student Use Guides</div>
                          <div className="text-muted-foreground">Step-by-step tutorials and best practices for responsible AI integration in coursework</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-muted/50">
                          <Download className="w-8 h-8 text-primary mx-auto mb-2" />
                          <div className="font-semibold text-foreground mb-2">Downloadable Resources</div>
                          <div className="text-muted-foreground">PDF exports, Canvas-ready formats, and standalone policy documents</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto">
              <SyllabusBuilderWizard />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AISyllabusBuilder;