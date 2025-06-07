
import React from 'react';
import { ArrowLeft, Clock, User, Tag, Printer, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DigitalCitizenshipArticleProps {
  onBack: () => void;
}

const DigitalCitizenshipArticle: React.FC<DigitalCitizenshipArticleProps> = ({ onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Building Digital Citizenship in the AI Era',
        text: 'In today\'s classrooms, digital citizenship has evolved far beyond teaching students to create strong passwords and avoid sharing personal information online.',
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
            <Badge variant="outline">Classroom Management</Badge>
          </div>
          
          <CardTitle className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
            Building Digital Citizenship in the AI Era
          </CardTitle>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>A.L.L.E.N. Educational Team</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>7 min read</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {['Digital Citizenship', 'AI Literacy', 'Ethics', 'Critical Thinking'].map((tag, index) => (
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
              In today's classrooms, digital citizenship has evolved far beyond teaching students to create strong passwords and avoid sharing personal information online. With artificial intelligence now embedded in students' daily digital experiences, educators face a critical new dimension of digital citizenship education: preparing students to be responsible, ethical, and critical consumers and creators in an AI-enhanced world.
            </p>

            <div className="my-8 text-center">
              <img 
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop" 
                alt="Building Digital Citizenship in the AI Era - Students using technology responsibly in a classroom setting"
                className="mx-auto rounded-lg shadow-lg max-w-2xl h-auto"
              />
              <p className="text-sm text-gray-600 mt-2 italic">
                Preparing students for responsible digital citizenship in an AI-enhanced world
              </p>
            </div>

            <hr className="my-8 border-gray-200" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">The Evolving Landscape of Digital Citizenship</h2>
              <p className="mb-4">
                Digital citizenship has traditionally encompassed online safety, privacy, communication etiquette, and information literacy. However, the rapid integration of AI tools into education and everyday life has expanded this concept to include AI literacy—understanding how AI works, its capabilities, its limitations, and the ethical implications of its use.
              </p>
              <p className="mb-4">
                According to research from Common Sense Media, digital citizenship education has demonstrated measurable positive impacts, with 93% of educators reporting that students develop essential digital skills through structured programs. As AI becomes increasingly prevalent, these programs must evolve to address new challenges and opportunities.
              </p>
            </section>

            <hr className="my-8 border-gray-200" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Essential AI Citizenship Skills for Students</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Critical Evaluation of AI-Generated Content</h3>
              <p className="mb-4">
                Students need to develop a healthy skepticism toward AI-generated content, understanding that while powerful, AI tools can produce inaccurate, biased, or misleading information. Teaching students to verify AI outputs against reliable sources is essential for navigating an information landscape increasingly populated with synthetic content.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm font-medium text-blue-900 mb-1">Classroom Strategy:</p>
                <p className="text-blue-800">Have students compare AI-generated explanations of historical events with primary sources and academic texts, identifying discrepancies and discussing why they might occur.</p>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Understanding AI's Role and Limitations</h3>
              <p className="mb-4">
                Students should recognize what AI can and cannot do, developing an accurate mental model of these tools as sophisticated pattern-matching systems rather than truly "intelligent" or "understanding" entities.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm font-medium text-blue-900 mb-1">Classroom Strategy:</p>
                <p className="text-blue-800">Create a "What AI Knows vs. How AI Knows" chart where students distinguish between human understanding (based on experience and context) and AI processing (based on statistical patterns in training data).</p>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Ethical Use Guidelines</h3>
              <p className="mb-4">
                Students need clear frameworks for when and how to use AI tools appropriately in academic and personal contexts.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm font-medium text-blue-900 mb-1">Classroom Strategy:</p>
                <p className="text-blue-800">Collaboratively develop classroom AI use guidelines that address questions like: When is AI assistance appropriate? How should AI contributions be acknowledged? What types of personal information should never be shared with AI tools?</p>
              </div>
            </section>

            <hr className="my-8 border-gray-200" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Implementing the D.I.V.E.R. Framework for AI Citizenship</h2>
              <p className="mb-4">
                The ALLEN D.I.V.E.R. framework provides an excellent structure for teaching digital citizenship in the AI era:
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Discovery</h3>
              <p className="mb-4">
                Encourage students to use AI as a starting point for exploration rather than an endpoint. For example, instead of accepting AI-generated research summaries at face value, have students use them to identify interesting questions for deeper investigation.
              </p>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <p className="text-sm font-medium text-green-900 mb-1">Prompt Example:</p>
                <p className="text-green-800">"Ask an AI to generate five surprising facts about ocean pollution. Which fact seems most interesting to you? What additional questions does it raise that you want to explore further?"</p>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Interaction & Collaboration</h3>
              <p className="mb-4">
                Create opportunities for students to discuss and compare their experiences with AI tools, developing collective wisdom about effective and responsible use.
              </p>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <p className="text-sm font-medium text-green-900 mb-1">Activity Idea:</p>
                <p className="text-green-800">Have students work in pairs to use different AI tools for the same research task, then compare results and discuss discrepancies, biases, or limitations they observed.</p>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Verification</h3>
              <p className="mb-4">
                Make fact-checking AI outputs a standard practice, teaching students to cross-reference information with reliable sources.
              </p>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <p className="text-sm font-medium text-green-900 mb-1">Classroom Routine:</p>
                <p className="text-green-800">Establish a "Trust but Verify" protocol where students must identify at least two credible sources that confirm key information provided by AI tools.</p>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Editing & Iteration</h3>
              <p className="mb-4">
                Teach students to view AI outputs as first drafts that require human refinement, critical thinking, and personalization.
              </p>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <p className="text-sm font-medium text-green-900 mb-1">Assignment Approach:</p>
                <p className="text-green-800">When AI is used for writing assistance, require students to highlight sections they've significantly revised and explain their editing decisions.</p>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Reflection</h3>
              <p className="mb-4">
                Guide students to consider both the benefits and potential concerns of AI integration in their digital lives.
              </p>
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <p className="text-sm font-medium text-green-900 mb-1">Discussion Questions:</p>
                <p className="text-green-800">How did using AI change your approach to this task? What did the AI do well? Where did it fall short? How did you ensure the final work represented your own understanding?</p>
              </div>
            </section>

            <hr className="my-8 border-gray-200" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Addressing Common Concerns</h2>
              <p className="mb-4">
                Many educators worry that AI tools will undermine authentic learning or critical thinking skills. However, research suggests that when properly integrated with strong digital citizenship education, AI can actually enhance these capabilities by:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Providing more opportunities for students to practice evaluation and verification skills</li>
                <li>Shifting focus from information acquisition to information assessment</li>
                <li>Creating authentic contexts for discussions about source reliability and bias</li>
                <li>Encouraging metacognition about learning processes</li>
              </ul>
            </section>

            <hr className="my-8 border-gray-200" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Moving Forward Together</h2>
              <p className="mb-4">
                Building digital citizenship in the AI era requires a partnership between educators, students, and families. Schools that have successfully navigated this transition typically:
              </p>
              <ol className="list-decimal pl-6 mb-6 space-y-2">
                <li>Provide professional development focused specifically on AI citizenship</li>
                <li>Create clear, consistent policies about appropriate AI use</li>
                <li>Engage parents through workshops and resources about AI tools</li>
                <li>Regularly update their approach as technologies evolve</li>
                <li>Emphasize transparency and open discussion rather than restriction</li>
              </ol>
              <p className="mb-4">
                By approaching AI as an opportunity to deepen digital citizenship education rather than a threat to traditional learning, educators can prepare students to become thoughtful, ethical participants in an increasingly AI-enhanced world—individuals who can leverage these powerful tools while maintaining their own critical thinking, creativity, and human judgment.
              </p>
            </section>

            <hr className="my-8 border-gray-200" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Works Cited</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <ul className="space-y-3 text-sm">
                  <li>
                    Buch, Eisha. "Teaching Digital Citizenship Has a Real Impact." <em>Common Sense Media</em>, 21 June 2024, 
                    <a href="https://www.commonsensemedia.org/kids-action/articles/teaching-digital-citizenship-has-a-real-impact" 
                       className="text-indigo-600 hover:text-indigo-800 underline ml-1" 
                       target="_blank" 
                       rel="noopener noreferrer">
                      www.commonsensemedia.org/kids-action/articles/teaching-digital-citizenship-has-a-real-impact
                    </a>
                  </li>
                  <li>
                    "Digital Citizenship and the Future of AI: Engagement, Ethics, and Privacy." <em>ResearchGate</em>, 21 Feb. 2025, 
                    <a href="https://www.researchgate.net/publication/388970040_Digital_Citizenship_and_the_Future_of_AI_Engagement_Ethics_and_Privacy" 
                       className="text-indigo-600 hover:text-indigo-800 underline ml-1" 
                       target="_blank" 
                       rel="noopener noreferrer">
                      www.researchgate.net/publication/388970040_Digital_Citizenship_and_the_Future_of_AI_Engagement_Ethics_and_Privacy
                    </a>
                  </li>
                  <li>
                    "Navigating the Landscape of AI Literacy Education." <em>Nature</em>, vol. 599, no. 7885, 16 Mar. 2025, pp. 345-358, doi:10.1038/s41599-025-04583-8.
                  </li>
                  <li>
                    "Nurturing Digital Citizenship in Society 5.0 Through AI and Computational Intelligence Education." <em>ResearchGate</em>, 2 Dec. 2024, 
                    <a href="https://www.researchgate.net/publication/386269171_Nurturing_Digital_Citizenship_in_Society_50_Through_AI_and_Computational_Intelligence_Education" 
                       className="text-indigo-600 hover:text-indigo-800 underline ml-1" 
                       target="_blank" 
                       rel="noopener noreferrer">
                      www.researchgate.net/publication/386269171_Nurturing_Digital_Citizenship_in_Society_50_Through_AI_and_Computational_Intelligence_Education
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

export default DigitalCitizenshipArticle;
