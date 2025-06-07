
import React from 'react';
import { ArrowLeft, Clock, User, Tag, Printer, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PromptEngineeringArticleProps {
  onBack: () => void;
}

const PromptEngineeringArticle: React.FC<PromptEngineeringArticleProps> = ({ onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Prompt Engineering for Educators: Crafting Effective AI Conversations',
        text: 'In today\'s AI-enhanced classroom, the quality of information you receive from AI tools depends largely on the quality of your prompts.',
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
            <Badge variant="outline">AI Implementation</Badge>
          </div>
          
          <CardTitle className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
            Prompt Engineering for Educators: Crafting Effective AI Conversations
          </CardTitle>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>A.L.L.E.N. Educational Team</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>6 min read</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {['Prompt Engineering', 'AI Implementation', 'Teaching Strategies', 'Digital Literacy'].map((tag, index) => (
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
              In today's AI-enhanced classroom, the quality of information you receive from AI tools depends largely on the quality of your prompts. Just as a well-crafted question leads students to deeper thinking, a skillfully engineered prompt guides AI toward more useful, accurate, and educationally valuable responses. This emerging skill—prompt engineering—is quickly becoming essential for educators looking to leverage AI effectively.
            </p>

            <div className="my-8 text-center">
              <img 
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop" 
                alt="Prompt Engineering for Educators - A MacBook with lines of code on its screen representing AI conversation crafting"
                className="mx-auto rounded-lg shadow-lg max-w-2xl h-auto"
              />
              <p className="text-sm text-gray-600 mt-2 italic">
                Crafting effective AI conversations through skillful prompt engineering
              </p>
            </div>

            <hr className="my-8 border-gray-200" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Understanding the Basics of Prompt Engineering</h2>
              <p className="mb-4">
                Prompt engineering is the process of crafting, refining, and optimizing inputs to obtain high-quality outcomes from AI models. For educators, this means designing prompts that generate meaningful educational content and foster student critical thinking rather than simply producing quick answers.
              </p>
              <p className="mb-4">
                The IDEA framework, developed specifically for educators by Dr. Jiyeon Park, provides a structured approach to prompt engineering that aligns with pedagogical goals:
              </p>
            </section>

            <hr className="my-8 border-gray-200" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">PARTS: Begin by Specifying Essential Components</h2>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Persona:</strong> Define the role you want the AI to assume (e.g., "Act as a history expert specializing in ancient civilizations")</li>
                <li><strong>Aim:</strong> Clarify your instructional goal (e.g., "Help students understand different perspectives on the Industrial Revolution")</li>
                <li><strong>Recipient:</strong> Identify the target audience (e.g., "Create content appropriate for 10th-grade students")</li>
                <li><strong>Theme:</strong> Specify the subject matter (e.g., "Focus on environmental impacts of industrialization")</li>
                <li><strong>Structure:</strong> Indicate the desired format (e.g., "Provide information in a compare/contrast format")</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">CLEAR: Ensure Your Prompts Are:</h2>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Concise:</strong> Avoid unnecessary words that might confuse the AI</li>
                <li><strong>Logical:</strong> Structure your request in a coherent sequence</li>
                <li><strong>Explicit:</strong> State exactly what you need, leaving little room for misinterpretation</li>
                <li><strong>Adaptive:</strong> Tailor prompts to the specific learning context</li>
                <li><strong>Restrictive:</strong> Set appropriate boundaries to keep responses focused and relevant</li>
              </ul>
            </section>

            <hr className="my-8 border-gray-200" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Moving Beyond Basic Prompts</h2>
              <p className="mb-4">
                The difference between basic and advanced prompt engineering often lies in the iterative refinement process. The REFINE approach encourages educators to:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Rephrase</strong> keywords to improve results</li>
                <li><strong>Experiment</strong> with context and examples</li>
                <li><strong>Feedback loop:</strong> Use AI responses to inform prompt revisions</li>
                <li><strong>Inquiry questions:</strong> Include specific questions that guide AI output</li>
                <li><strong>Navigate by iterations:</strong> Make incremental improvements</li>
                <li><strong>Evaluate and verify</strong> outputs for accuracy and relevance</li>
              </ul>
              
              <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Example Transformation:</h3>
                <p className="mb-2"><strong>Basic prompt:</strong> "Give me information about photosynthesis"</p>
                <p><strong>Enhanced prompt:</strong> "As a biology educator creating materials for 7th-grade students, provide an explanation of photosynthesis that includes three surprising facts, a simple diagram description, and two real-world applications. Use vocabulary appropriate for middle school students and highlight key terms that should be defined."</p>
              </div>
            </section>

            <hr className="my-8 border-gray-200" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Classroom Implementation Strategies</h2>
              <p className="mb-4">
                Prompt engineering isn't just for teacher preparation—it's a valuable skill to teach students as well. Consider these approaches:
              </p>
              <ol className="list-decimal pl-6 mb-6 space-y-3">
                <li><strong>Model effective prompting:</strong> Share your screen as you craft and refine prompts, thinking aloud about your choices and revisions.</li>
                <li><strong>Create prompt templates:</strong> Develop fill-in-the-blank prompt structures for different educational purposes (research, brainstorming, feedback, etc.).</li>
                <li><strong>Implement prompt workshops:</strong> Have students collaborate to improve basic prompts, then compare the resulting AI outputs.</li>
                <li><strong>Establish prompt evaluation criteria:</strong> Teach students to assess whether their prompts produced useful, accurate, and appropriate responses.</li>
                <li><strong>Connect to the D.I.V.E.R. framework:</strong> Show how well-crafted prompts support Discovery (by encouraging exploration rather than just answers), Interaction (by facilitating meaningful AI conversations), Verification (by requesting sources), Editing (by generating content that requires human refinement), and Reflection (by prompting students to consider AI limitations).</li>
              </ol>
            </section>

            <hr className="my-8 border-gray-200" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Pitfalls to Avoid</h2>
              <p className="mb-4">Even experienced educators can fall into these prompt engineering traps:</p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Vague instructions:</strong> "Tell me about climate change" vs. "Explain three major causes of climate change and their differential impacts on coastal vs. inland communities"</li>
                <li><strong>Overlooking context:</strong> Failing to specify grade level, prior knowledge, or learning objectives</li>
                <li><strong>Neglecting to request evidence:</strong> Not asking AI to provide sources or reasoning for its responses</li>
                <li><strong>Single-attempt approach:</strong> Giving up after one try rather than refining prompts based on initial results</li>
              </ul>
            </section>

            <hr className="my-8 border-gray-200" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Looking Forward</h2>
              <p className="mb-4">
                As AI tools evolve, prompt engineering skills will become increasingly valuable for educators. By mastering these techniques, teachers can save time on routine tasks while creating more personalized, engaging learning experiences. The goal isn't to replace teacher expertise but to become "augmented educators" who skillfully collaborate with AI to enhance student learning.
              </p>
              <p className="mb-4">
                When students see teachers thoughtfully engaging with AI—crafting careful prompts, critically evaluating responses, and modeling ethical use—they learn not just about subject matter but about becoming thoughtful digital citizens who can harness technology while maintaining human judgment and creativity.
              </p>
            </section>

            <hr className="my-8 border-gray-200" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Works Cited</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <ul className="space-y-3 text-sm">
                  <li>
                    Park, Jiyeon. "CIDDL Research and Practice Brief: Generative AI Prompt Engineering for Educators." CIDDL, 12 Feb. 2025, 
                    <a href="https://ciddl.org/ciddl-research-and-practice-brief-generative-ai-prompt-engineering-for-educators/" 
                       className="text-indigo-600 hover:text-indigo-800 underline ml-1" 
                       target="_blank" 
                       rel="noopener noreferrer">
                      ciddl.org/ciddl-research-and-practice-brief-generative-ai-prompt-engineering-for-educators/
                    </a>
                  </li>
                  <li>
                    Daly, Peter, and Emmanuelle Deglaire. "AI-enabled Correction: A Professor's Journey." <em>Innovations in Education and Teaching International</em>, 2024, pp. 1-17, doi:10.1080/14703297.2024.2390486.
                  </li>
                  <li>
                    Google for Educators. "Prompt Engineering Framework for Education." Google for Education, 2024.
                  </li>
                  <li>
                    Lo, David. "Designing CLEAR Prompts for Educational AI Applications." <em>Educational Technology Journal</em>, vol. 18, no. 3, 2023, pp. 215-230.
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

export default PromptEngineeringArticle;
