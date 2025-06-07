import React from 'react';
import { ArrowLeft, Clock, User, Tag, Printer, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AssessmentArticleProps {
  onBack: () => void;
}

const AssessmentArticle: React.FC<AssessmentArticleProps> = ({ onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Rethinking Assessment in the Age of AI: From Product to Process',
        text: 'In an era where artificial intelligence can generate essays, solve complex problems, and even simulate human conversation, traditional assessment methods are facing unprecedented challenges.',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('URL copied to clipboard!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="default" className="bg-indigo-600">Featured Article</Badge>
            <Badge variant="outline">Assessment & Feedback</Badge>
          </div>
          
          <CardTitle className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
            Rethinking Assessment in the Age of AI: From Product to Process
          </CardTitle>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>A.L.L.E.N. Educational Team</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>12 min read</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {['AI Integration', 'Assessment Methods', 'Process Evaluation', 'Academic Integrity'].map((tag, index) => (
              <div key={index} className="flex items-center gap-1 text-sm text-gray-600">
                <Tag className="w-3 h-3" />
                <span>{tag}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </CardHeader>

        <CardContent className="prose prose-lg max-w-none">
          <div className="text-gray-700 leading-relaxed space-y-6">
            <p className="text-xl font-medium text-gray-800 mb-8">
              In an era where artificial intelligence (AI) can generate essays, solve complex problems, and even simulate human conversation, traditional assessment methods are facing unprecedented challenges. The ease with which students can utilize AI tools to produce polished assignments calls into question the efficacy of evaluating solely the final product. To ensure that assessments truly reflect a student's understanding and learning journey, educators must pivot towards evaluating the learning process itself.
            </p>

            <div className="my-8 text-center">
              <img 
                src="/lovable-uploads/3d7e2873-9f44-4096-809f-a9eb33f740a6.png" 
                alt="Rethinking Assessment in the Age of AI: From Product to Process - Visual representation of AI-enhanced assessment methods"
                className="mx-auto rounded-lg shadow-lg max-w-2xl h-auto"
              />
              <p className="text-sm text-gray-600 mt-2 italic">
                The transformation of assessment methods in the AI era
              </p>
            </div>

            <hr className="my-8 border-gray-200" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">The Limitations of Traditional Assessments</h2>
              <p className="mb-4">
                Historically, education has emphasized summative assessments—final exams, term papers, and standardized tests—as primary indicators of student learning. These methods focus on the end result, often neglecting the cognitive and metacognitive processes students engage in during learning. With AI's capability to produce high-quality outputs rapidly, there's a growing concern that such assessments may no longer accurately represent a student's individual effort or comprehension.
              </p>
              <p className="mb-4">
                For instance, a student might submit an essay generated largely by an AI tool, raising questions about authorship and genuine understanding. This scenario underscores the need for assessments that can differentiate between AI-generated content and a student's authentic work.
              </p>
            </section>

            <hr className="my-8 border-gray-200" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Emphasizing the Learning Process</h2>
              <p className="mb-4">
                To address these concerns, educators are exploring assessment strategies that prioritize the learning process over the final product. This shift involves evaluating how students arrive at their conclusions, the strategies they employ, and their ability to reflect on their learning journey.
              </p>
              <p className="mb-4">
                One approach is incorporating formative assessments, which provide ongoing feedback and allow students to reflect and improve continuously. Tools like learning journals, drafts with feedback loops, and peer reviews can offer insights into a student's thought process and development over time. Such methods not only promote deeper learning but also make it more challenging for students to rely solely on AI-generated content.
              </p>
            </section>

            <hr className="my-8 border-gray-200" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Integrating AI Transparently</h2>
              <p className="mb-4">
                Rather than viewing AI as a threat to academic integrity, educators can integrate it as a learning tool. By encouraging students to document their interactions with AI—such as prompts used, iterations made, and reflections on the AI's suggestions—teachers can assess students' critical thinking and decision-making skills. This transparency allows educators to evaluate not just the final output but also the student's ability to engage with AI thoughtfully and ethically.
              </p>
            </section>

            <hr className="my-8 border-gray-200" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Case Studies and Global Initiatives</h2>
              <p className="mb-4">
                Several educational institutions worldwide are pioneering this shift in assessment philosophy. In South Australia, for example, the Education Department has implemented an AI chatbot to assess students' English proficiency, significantly reducing teacher workload while maintaining assessment quality.
              </p>
              <p className="mb-4">
                Similarly, in Maharashtra, India, a holistic evaluation system now involves teachers, peers, and parents in assessing students, providing a 360-degree view of a student's development. These initiatives highlight the global recognition of the need to evolve assessment methods in response to technological advancements.
              </p>
            </section>

            <hr className="my-8 border-gray-200" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Moving Forward</h2>
              <p className="mb-4">
                The integration of AI into education necessitates a reevaluation of assessment strategies. By focusing on the learning process, promoting transparency in AI usage, and adopting holistic evaluation methods, educators can ensure that assessments remain meaningful and reflective of a student's true capabilities.
              </p>
              <p className="mb-4">
                As we navigate this new educational landscape, it's imperative to remember that the goal of assessment is not merely to grade but to understand and support the learner's journey.
              </p>
            </section>

            <hr className="my-8 border-gray-200" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">References</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <ul className="space-y-3 text-sm">
                  <li>
                    <a href="https://www.equitechfutures.com/articles/rethinking-assessment-in-the-age-of-ai" 
                       className="text-indigo-600 hover:text-indigo-800 underline" 
                       target="_blank" 
                       rel="noopener noreferrer">
                      "Rethinking Assessment in the Age of AI," Equitech Futures.
                    </a>
                  </li>
                  <li>
                    <a href="https://www.ajjuliani.com/blog/how-to-assess-the-learning-process-not-the-final-product" 
                       className="text-indigo-600 hover:text-indigo-800 underline" 
                       target="_blank" 
                       rel="noopener noreferrer">
                      "How to Assess the Learning Process, Not the Final Product," AJ Juliani.
                    </a>
                  </li>
                  <li>
                    <a href="https://www.aacsb.edu/insights/articles/2024/04/ai-and-assessment-where-we-are-now" 
                       className="text-indigo-600 hover:text-indigo-800 underline" 
                       target="_blank" 
                       rel="noopener noreferrer">
                      "AI and Assessment: Where We Are Now," AACSB Insights.
                    </a>
                  </li>
                  <li>
                    <a href="https://www.theaustralian.com.au/education/artificial-intelligence-is-being-used-to-assess-school-students-english-skills/news-story/248d31b91440f295dcae618e738355a9" 
                       className="text-indigo-600 hover:text-indigo-800 underline" 
                       target="_blank" 
                       rel="noopener noreferrer">
                      "Teachers Embrace Chatbots to Assess Students," The Australian.
                    </a>
                  </li>
                  <li>
                    <a href="https://timesofindia.indiatimes.com/city/pune/besides-teachers-parents-peers-to-assess-students-from-this-academic-year/articleshow/121555255.cms" 
                       className="text-indigo-600 hover:text-indigo-800 underline" 
                       target="_blank" 
                       rel="noopener noreferrer">
                      "Besides Teachers, Parents & Peers to Assess Students from This Academic Year," Times of India.
                    </a>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssessmentArticle;
