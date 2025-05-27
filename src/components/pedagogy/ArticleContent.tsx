
import React from 'react';
import { ArrowLeft, Clock, User, Tag, Printer, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ArticleContentProps {
  onBack: () => void;
}

const ArticleContent = ({ onBack }: ArticleContentProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Hub
        </Button>
        
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="default" className="bg-indigo-600">Featured Article</Badge>
          <Badge variant="outline">Learning Theory</Badge>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
          Cognitive Load Theory & AI: Balancing Mental Effort in the Digital Classroom
        </h1>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>A.L.L.E.N. Educational Team</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>8 min read</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-700 leading-relaxed mb-8">
              In today's rapidly evolving educational landscape, teachers face the dual challenge of integrating new technologies while ensuring students aren't overwhelmed. Artificial intelligence (AI) tools offer exciting possibilities for education, but their effectiveness depends on how well they align with how our brains actually process information. This is where Cognitive Load Theory (CLT) provides valuable insights for classroom implementation.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Understanding Cognitive Load Theory</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cognitive Load Theory, developed by John Sweller in the late 1980s, explains how our working memory has limited capacity when processing new information. The theory identifies three types of cognitive load that affect learning:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Intrinsic load:</strong> The inherent difficulty of the subject matter itself</li>
              <li><strong>Extraneous load:</strong> Mental effort wasted due to poor instructional design</li>
              <li><strong>Germane load:</strong> Productive mental effort that contributes to learning and schema building</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-6">
              The goal for effective teaching is to manage intrinsic load, minimize extraneous load, and maximize germane load—a balance that AI tools can either help or hinder.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How AI Can Reduce Cognitive Overload</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              When thoughtfully implemented, AI can significantly enhance learning by optimizing cognitive resources:
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Personalized Learning Pathways</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              AI can adjust content difficulty based on individual student needs, maintaining optimal intrinsic load. For example, adaptive learning platforms can present concepts at the right pace for each student, preventing both boredom and frustration.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Streamlined Information Delivery</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              AI-powered tools can simplify complex concepts through visual aids, interactive simulations, and just-in-time explanations. This reduces extraneous load by presenting information in more digestible formats.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Enhanced Engagement</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              Gamified AI learning environments can positively influence germane load by deeply engaging students with content. When students are motivated and engaged, they're more likely to invest mental effort in meaningful learning.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Potential Pitfalls to Watch For</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Despite its benefits, AI implementation requires careful consideration:
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Over-reliance Risk</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Students may become excessively dependent on AI tools, diminishing their ability to engage with learning materials independently. This dependency can reduce the healthy intrinsic load needed for developing critical thinking skills.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Interface Complexity</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              If AI tools aren't user-friendly, their complexity can increase extraneous load by complicating the learning process rather than simplifying it.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Distraction Potential</h3>
            <p className="text-gray-700 leading-relaxed mb-6">
              Flashy features and notifications can divert attention from core learning objectives, increasing extraneous load and reducing learning effectiveness.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Practical Implementation Tips</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To leverage AI while honoring cognitive load principles:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Start Simple:</strong> Introduce one AI tool at a time, allowing students to develop proficiency before adding more complexity.</li>
              <li><strong>Provide Clear Scaffolding:</strong> Create structured guides for AI tool use, gradually removing support as students gain confidence.</li>
              <li><strong>Focus on Thinking, Not Just Answers:</strong> Use AI to promote deeper questioning rather than quick solutions.</li>
              <li><strong>Monitor and Adjust:</strong> Regularly assess whether AI tools are reducing or adding to cognitive load through student feedback and observation.</li>
              <li><strong>Balance AI with Human Interaction:</strong> Ensure AI supplements rather than replaces valuable peer and teacher interactions.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Classroom Application Example</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              When teaching photosynthesis, rather than asking AI to simply explain the process, have students use the ALLEN D.I.V.E.R. framework:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Discovery:</strong> "Ask AI to generate five surprising facts about photosynthesis. What stands out to you? What would you like to learn more about?"</li>
              <li><strong>Interaction:</strong> Compare AI-generated explanations with partners to identify differences and similarities</li>
              <li><strong>Verification:</strong> Have students fact-check AI responses against reliable sources</li>
              <li><strong>Editing:</strong> Guide students to refine and personalize AI-generated content</li>
              <li><strong>Reflection:</strong> Prompt students to consider how AI helped their understanding and what challenges they faced</li>
            </ul>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 my-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Visual Element Suggestion</h3>
              <p className="text-blue-800">
                [Insert diagram showing the three types of cognitive load and how AI tools can either increase or decrease each type, with specific examples of classroom applications]
              </p>
            </div>

            <p className="text-gray-700 leading-relaxed mb-8">
              By thoughtfully integrating AI tools with cognitive load principles, teachers can create learning environments that leverage technology while respecting the natural limitations of human cognition—ultimately helping students become better thinkers, problem solvers, and questioners.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Works Cited</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <ul className="space-y-3 text-sm">
                <li>
                  Seung, Yerin. "The Impact of Artificial Intelligence on Cognitive Load." <em>CIDDL</em>, 10 June 2024, ciddl.org/the-impact-of-artificial-intelligence-on-cognitive-load/.
                </li>
                <li>
                  Koć-Januchta, Marta M., et al. "Connecting Concepts Helps Put Main Ideas Together: Cognitive Load and Usability in Learning Biology with an AI-Enriched Textbook." <em>International Journal of Educational Technology in Higher Education</em>, vol. 18, no. 11, 2022, doi:10.1186/s41239-021-00317-3.
                </li>
                <li>
                  Sweller, John. "Cognitive Load Theory, Learning Difficulty, and Instructional Design." <em>Learning and Instruction</em>, vol. 4, no. 4, 1994, pp. 295-312.
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArticleContent;
