
import React from 'react';

const AboutHero = () => {
  return (
    <section className="bg-gradient-to-br from-indigo-50 to-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Built by a Working Professor, for Working Instructors
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            Allen Grade Assist isn't a product a marketing team dreamed up. It's the tool
            Allen Fortune built to survive his own grading load — and still uses on his live
            Canvas courses every week.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            <div className="w-48 h-48 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img
                src="/lovable-uploads/d644e2ea-e597-4168-bff4-35ee20a31995.png"
                alt="Allen Fortune, psychology professor and creator of Allen Grade Assist"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">Allen Fortune</h2>
              <p className="text-indigo-600 font-medium mb-4">
                Full-Time Psychology Faculty, Lemoore College (West Hills Community College District)
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Allen teaches multiple psychology sections each semester — including abnormal
                psychology and general psychology — with the discussion boards, short-answer
                work, and essays that come with them. No TA. He built Allen Grade Assist
                because grading meaningful feedback into hundreds of submissions was consuming
                his evenings and weekends, and nothing on the market was built for how a
                Canvas instructor actually works.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Every feature ships only after it survives his own courses. When something in
                the product says "this saves time," it's because it saved his — on real
                sections, with real students, inside real Canvas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
