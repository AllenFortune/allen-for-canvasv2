
import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PedagogyHero from "@/components/pedagogy/PedagogyHero";
import FeaturedArticle from "@/components/pedagogy/FeaturedArticle";
import ArticlesList from "@/components/pedagogy/ArticlesList";
import PedagogyNavigation from "@/components/pedagogy/PedagogyNavigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const AIPedagogyHub = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <PedagogyHero />
        
        {/* AI Literacy Tools Card */}
        <Card className="mb-12 border-l-4 border-l-indigo-600 bg-gradient-to-r from-indigo-50 to-white">
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
    </div>
  );
};

export default AIPedagogyHub;
