
import React from 'react';

const AboutHero = () => {
  return (
    <section className="bg-gradient-to-br from-indigo-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Built by a Teacher for Teachers
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            A.L.L.E.N. was created by an educator who understands the daily challenges of grading 
            and providing meaningful feedback. This is AI assistance designed with real classroom experience.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            <div className="w-48 h-48 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img 
                src="/lovable-uploads/d644e2ea-e597-4168-bff4-35ee20a31995.png" 
                alt="Teacher and creator of A.L.L.E.N." 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Created by Educators, for Educators
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Every feature in A.L.L.E.N. comes from real teaching experience and understanding 
                the time constraints, grading fatigue, and desire to provide quality feedback that 
                helps students grow. This isn't just another tech solution—it's a teaching tool 
                built with classroom reality in mind.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
