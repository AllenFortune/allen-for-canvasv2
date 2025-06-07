
import React from 'react';
import { ArrowLeft, Clock, User, Tag, Printer, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DiverFrameworkArticleProps {
  onBack: () => void;
}

const DiverFrameworkArticle = ({ onBack }: DiverFrameworkArticleProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Hub
        </Button>
        
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="default" className="bg-green-600">Best Practices</Badge>
          <Badge variant="outline">Teaching Frameworks</Badge>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
          The ALLEN D.I.V.E.R. Framework: A Complete Guide to AI-Enhanced Learning
        </h1>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>A.L.L.E.N. Educational Team</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>10 min read</span>
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
              The ALLEN D.I.V.E.R. Framework represents a systematic approach to integrating AI tools in education while maintaining pedagogical integrity and promoting deep learning. This framework ensures that AI enhances rather than replaces critical thinking, collaboration, and authentic learning experiences.
            </p>

            <div className="my-8 text-center">
              <img 
                src="/lovable-uploads/9b9a024a-bcdb-4d86-b904-01f12b451865.png" 
                alt="ALLEN D.I.V.E.R. Framework for AI-Enhanced Assignments showing the five steps: Discovery, Interaction & Collaboration, Verification, Editing & Iteration, and Reflection"
                className="mx-auto rounded-lg shadow-lg max-w-2xl h-auto"
              />
              <p className="text-sm text-gray-600 mt-2 italic">
                The complete ALLEN D.I.V.E.R. Framework for AI-Enhanced Assignments
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What is the D.I.V.E.R. Framework?</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              D.I.V.E.R. is an acronym that stands for Discovery, Interaction & Collaboration, Verification, Editing & Iteration, and Reflection. Each step is designed to engage students in meaningful learning while leveraging AI as a powerful educational tool rather than a shortcut to answers.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">The Five Components Explained</h2>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">D - Discovery: Encouraging Exploration</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Discovery phase shifts students from passive consumption to active exploration. Instead of simply asking AI for answers, students are encouraged to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Generate multiple perspectives on a topic</li>
              <li>Explore "what if" scenarios</li>
              <li>Discover surprising facts or connections</li>
              <li>Identify knowledge gaps and areas for deeper investigation</li>
            </ul>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <p className="text-blue-800"><strong>Example:</strong> "Ask AI to generate five different explanations for why the Roman Empire fell, then identify which explanation surprises you most and why."</p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">I - Interaction & Collaboration</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              This phase emphasizes that learning is inherently social. Students work together to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Compare AI-generated responses with peers</li>
              <li>Discuss differences in AI outputs</li>
              <li>Build on each other's AI-assisted discoveries</li>
              <li>Develop collective understanding through dialogue</li>
            </ul>
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
              <p className="text-green-800"><strong>Example:</strong> "Share your AI-generated solutions with your group. What patterns do you notice? Where do the responses differ, and what might explain those differences?"</p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">V - Verification: Building Critical Evaluation Skills</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Students learn to be critical consumers of AI-generated content by:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Fact-checking AI responses against reliable sources</li>
              <li>Identifying potential biases or limitations</li>
              <li>Cross-referencing information across multiple sources</li>
              <li>Developing information literacy skills</li>
            </ul>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-yellow-800"><strong>Example:</strong> "Verify the historical dates and facts in your AI response using at least two credible sources. What discrepancies, if any, did you find?"</p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">E - Editing & Iteration: Making It Your Own</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Students transform AI-generated content into their own understanding by:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Rewriting content in their own voice</li>
              <li>Adding personal examples and connections</li>
              <li>Improving clarity and organization</li>
              <li>Incorporating verified information from multiple sources</li>
            </ul>
            <div className="bg-purple-50 border-l-4 border-purple-400 p-4 mb-6">
              <p className="text-purple-800"><strong>Example:</strong> "Take the AI-generated explanation and rewrite it as if you're teaching it to a younger student. Add your own examples and make connections to your personal experience."</p>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">R - Reflection: Metacognitive Awareness</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The final phase develops metacognitive skills as students:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Analyze their learning process</li>
              <li>Identify what surprised them</li>
              <li>Recognize challenges they encountered</li>
              <li>Evaluate the effectiveness of AI as a learning tool</li>
            </ul>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <p className="text-red-800"><strong>Example:</strong> "Reflect on your learning process: What did you discover that you wouldn't have found without AI? What challenges did you face in verifying information? How has your understanding of the topic evolved?"</p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Implementation Strategies</h2>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Getting Started</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Begin with one phase:</strong> Start with Discovery or Reflection to build comfort</li>
              <li><strong>Model the process:</strong> Demonstrate each phase with the whole class first</li>
              <li><strong>Provide clear prompts:</strong> Give students specific questions for each phase</li>
              <li><strong>Set expectations:</strong> Explain why each step matters for learning</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Assessment Considerations</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Process over product:</strong> Evaluate students' engagement with each phase</li>
              <li><strong>Reflection quality:</strong> Assess depth of metacognitive thinking</li>
              <li><strong>Collaboration skills:</strong> Observe how students build on each other's ideas</li>
              <li><strong>Critical thinking:</strong> Evaluate verification and editing processes</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Subject-Specific Applications</h2>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Science</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Use D.I.V.E.R. for hypothesis generation, experimental design, and data interpretation. Students can explore multiple scientific explanations, verify claims against research, and reflect on the nature of scientific inquiry.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Language Arts</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Apply the framework to creative writing, literary analysis, and research projects. Students can generate multiple narrative perspectives, collaborate on story development, and critically evaluate AI-generated content for bias and accuracy.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Social Studies</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Perfect for exploring historical perspectives, current events analysis, and civic engagement. Students can discover multiple viewpoints on historical events, verify claims using primary sources, and reflect on the complexity of social issues.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Benefits of the D.I.V.E.R. Framework</h2>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li><strong>Maintains academic integrity:</strong> Students engage in authentic learning rather than copying AI responses</li>
              <li><strong>Develops critical thinking:</strong> Each phase requires analysis, evaluation, and synthesis</li>
              <li><strong>Builds digital literacy:</strong> Students learn to be discerning consumers of AI-generated content</li>
              <li><strong>Encourages collaboration:</strong> Peer interaction remains central to the learning process</li>
              <li><strong>Promotes metacognition:</strong> Regular reflection develops self-awareness about learning</li>
              <li><strong>Scalable implementation:</strong> Can be adapted for any subject area and grade level</li>
            </ul>

            <div className="bg-indigo-50 border-l-4 border-indigo-400 p-6 my-8">
              <h3 className="text-lg font-semibold text-indigo-900 mb-2">Ready to Implement?</h3>
              <p className="text-indigo-800">
                Start small by implementing one phase of D.I.V.E.R. in your next lesson. As students become comfortable with the process, gradually incorporate all five phases to create rich, AI-enhanced learning experiences that promote deep thinking and authentic engagement.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Additional Resources</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <ul className="space-y-3 text-sm">
                <li>
                  <strong>Download:</strong> D.I.V.E.R. Framework Planning Template [Coming Soon]
                </li>
                <li>
                  <strong>Watch:</strong> Implementation Video Series [Coming Soon]
                </li>
                <li>
                  <strong>Connect:</strong> Join the D.I.V.E.R. Framework Community Forum [Coming Soon]
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiverFrameworkArticle;
