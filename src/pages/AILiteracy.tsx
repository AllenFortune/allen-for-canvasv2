
import React from 'react';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import AILiteracyHero from "@/components/ai-literacy/AILiteracyHero";
import FeaturedResources from "@/components/ai-literacy/FeaturedResources";
import ResourceCategories from "@/components/ai-literacy/ResourceCategories";
import CommunitySection from "@/components/ai-literacy/CommunitySection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const AILiteracy = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <AILiteracyHero />
            
            {/* AI Pedagogy Hub Card */}
            <Card className="mb-12 border-l-4 border-l-indigo-600 bg-gradient-to-r from-indigo-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                  AI Pedagogy Hub
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Dive deeper into evidence-based teaching strategies and frameworks for AI integration. 
                  Access detailed articles on cognitive load theory, the D.I.V.E.R. framework, and more.
                </p>
                <Link to="/ai-pedagogy">
                  <Button className="bg-indigo-600 hover:bg-indigo-700">
                    Explore Pedagogy Hub
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <FeaturedResources />
            <ResourceCategories />
            <CommunitySection />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default AILiteracy;
