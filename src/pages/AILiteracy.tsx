
import React from 'react';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import AILiteracyHero from "@/components/ai-literacy/AILiteracyHero";
import FeaturedResources from "@/components/ai-literacy/FeaturedResources";
import ResourceCategories from "@/components/ai-literacy/ResourceCategories";
import CommunitySection from "@/components/ai-literacy/CommunitySection";

const AILiteracy = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <AILiteracyHero />
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
