
import React from 'react';
import { BookOpen, Users, Lightbulb } from 'lucide-react';

const PedagogyHero = () => {
  return (
    <section className="text-center mb-12">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          AI Pedagogy Hub
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Evidence-based resources for integrating AI in education. Discover research-backed 
          strategies, practical implementation guides, and proven frameworks for enhancing 
          learning with artificial intelligence.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Research-Based</h3>
          <p className="text-gray-600">Articles grounded in educational research and cognitive science</p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Classroom-Tested</h3>
          <p className="text-gray-600">Practical strategies from real educators in real classrooms</p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Innovation Focus</h3>
          <p className="text-gray-600">Forward-thinking approaches to AI integration in education</p>
        </div>
      </div>
    </section>
  );
};

export default PedagogyHero;
