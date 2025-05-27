
import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PedagogyHero from "@/components/pedagogy/PedagogyHero";
import FeaturedArticle from "@/components/pedagogy/FeaturedArticle";
import ArticlesList from "@/components/pedagogy/ArticlesList";
import PedagogyNavigation from "@/components/pedagogy/PedagogyNavigation";

const AIPedagogyHub = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <PedagogyHero />
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
