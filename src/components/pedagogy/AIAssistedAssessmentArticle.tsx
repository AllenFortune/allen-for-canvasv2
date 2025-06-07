
import React from 'react';
import { ArrowLeft, Clock, User, Tag, Printer, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AIAssistedAssessmentArticleProps {
  onBack: () => void;
}

const AIAssistedAssessmentArticle: React.FC<AIAssistedAssessmentArticleProps> = ({ onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'AI-Assisted Assessment: Beyond Auto-Grading',
        text: 'In the evolving landscape of educational technology, AI-assisted assessment has emerged as a powerful tool with potential far beyond simply automating the grading process.',
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
            AI-Assisted Assessment: Beyond Auto-Grading
          </CardTitle>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>A.L.L.E.N. Educational Team</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>8 min read</span>
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
              In the evolving landscape of educational technology, AI-assisted assessment has emerged as a powerful tool with potential far beyond simply automating the grading process. While auto-grading multiple-choice questions has been around for decades, today's AI tools offer sophisticated capabilities that can transform how we approach student feedback, formative assessment, and the entire evaluation process.
            </p>

            <div className="my-8 text-center">
              <img 
                src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=600&fit=crop" 
                alt="AI-Assisted Assessment: Beyond Auto-Grading - Modern classroom with technology integration for assessment"
                className="mx-auto rounded-lg shadow-lg max-w-2xl h-auto"
              />
              <p className="text-sm text-gray-600 mt-2 italic">
                AI-assisted assessment transforms traditional grading into comprehensive feedback systems
              </p>
            </div>

            <hr className="my-8 border-gray-200" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Moving Beyond the Red Pen</h2>
              <p className="mb-4">
                Traditional assessment often conjures images of teachers hunched over stacks of papers late into the night, red pen in hand. This time-consuming process can delay valuable feedback and limit the depth of guidance teachers can provide. AI-assisted assessment tools are changing this paradigm by handling routine aspects of grading while enabling teachers to focus on more nuanced, personalized feedback.
              </p>
              <p className="mb-4">
                As researchers at MIT Sloan Teaching & Learning Technologies note, "Grading students' work is a time-consuming and often challenging task. Artificial intelligence tools can help instructors save time and provide students with immediate feedback." However, they caution that AI is "not a magic wand that can replace human judgment and expertise."
              </p>
            </section>

            <hr className="my-8 border-gray-200" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">The Assessment Spectrum: Where AI Excels and Where Humans Remain Essential</h2>
              <p className="mb-4">
                Understanding where AI can add value requires breaking down the assessment process into distinct components:
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Objective Assessment</h3>
              <p className="mb-4">AI tools excel at evaluating clearly defined, objective elements:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Mathematical calculations and problem-solving steps</li>
                <li>Grammar, spelling, and basic writing mechanics</li>
                <li>Factual recall and knowledge verification</li>
                <li>Code functionality and syntax in programming assignments</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Subjective Assessment</h3>
              <p className="mb-4">Human judgment remains crucial for more nuanced aspects:</p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Creative originality and innovation</li>
                <li>Ethical reasoning and value judgments</li>
                <li>Contextual understanding and real-world application</li>
                <li>Interdisciplinary connections and synthesis</li>
              </ul>
            </section>

            <hr className="my-8 border-gray-200" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">The "8C" Framework for Effective Implementation</h2>
              <p className="mb-4">
                Research from EDHEC Business School offers a valuable "8C" framework for educators implementing AI-assisted assessment:
              </p>
              <ol className="list-decimal pl-6 mb-6 space-y-2">
                <li><strong>Curiosity/Creativity:</strong> Approach AI tools with an experimental mindset</li>
                <li><strong>Confidence:</strong> Build trust in both the tools and institutional support</li>
                <li><strong>Composition:</strong> Consider how assignment design affects AI assessment capabilities</li>
                <li><strong>Clarification:</strong> Clearly define expectations and assessment criteria</li>
                <li><strong>Comparison:</strong> Evaluate different AI tools for specific assessment needs</li>
                <li><strong>Compatibility:</strong> Ensure integration with existing learning management systems</li>
                <li><strong>Control:</strong> Maintain quality oversight and human verification</li>
                <li><strong>Cost:</strong> Consider time and resource investments against benefits</li>
              </ol>
              <p className="mb-4">
                This framework emphasizes that successful implementation isn't just about the technology—it's about thoughtful integration into existing assessment practices.
              </p>
            </section>

            <hr className="my-8 border-gray-200" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Practical Applications in the Classroom</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Formative Assessment Enhancement</h3>
              <p className="mb-4">
                AI tools can provide immediate feedback during the learning process, not just at assignment completion:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Writing assistants that offer real-time guidance on structure and clarity</li>
                <li>Math tools that identify conceptual misunderstandings as students work through problems</li>
                <li>Language learning applications that provide pronunciation feedback and suggest improvements</li>
              </ul>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm font-medium text-blue-900 mb-1">Classroom Example:</p>
                <p className="text-blue-800">A high school English teacher uses AI to provide initial feedback on essay drafts. Students receive immediate guidance on structure, clarity, and mechanics, allowing them to make improvements before peer review sessions. The teacher then focuses feedback on higher-order concerns like argumentation and evidence.</p>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Personalized Feedback at Scale</h3>
              <p className="mb-4">Even in large classes, AI can help deliver individualized guidance:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Identifying patterns in student work that suggest specific misconceptions</li>
                <li>Generating customized practice problems targeting areas of weakness</li>
                <li>Creating differentiated feedback based on student performance levels</li>
              </ul>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-sm font-medium text-blue-900 mb-1">Classroom Example:</p>
                <p className="text-blue-800">A middle school math teacher uses AI to analyze quiz results across 120 students, quickly identifying that one class section struggles specifically with negative number operations. This allows for targeted reteaching before moving to more advanced concepts.</p>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Rubric-Enhanced Evaluation</h3>
              <p className="mb-4">AI can support consistent application of assessment criteria:</p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Highlighting elements in student work that align with specific rubric dimensions</li>
                <li>Suggesting preliminary scores based on comparison with exemplars</li>
                <li>Flagging potential inconsistencies in grading across multiple assignments</li>
              </ul>
            </section>

            <hr className="my-8 border-gray-200" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Implementing the D.I.V.E.R. Framework in AI-Assisted Assessment</h2>
              <p className="mb-4">
                The ALLEN D.I.V.E.R. framework provides an excellent structure for integrating AI into assessment practices:
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Discovery</h3>
              <p className="mb-4">
                Use AI assessment data to identify patterns and learning opportunities that might otherwise remain hidden.
              </p>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <p className="text-sm font-medium text-green-900 mb-1">Activity Example:</p>
                <p className="text-green-800">Have students analyze AI-generated feedback on their work to identify common strengths and areas for improvement, then set specific learning goals based on these insights.</p>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Interaction & Collaboration</h3>
              <p className="mb-4">
                Create feedback loops between AI insights, teacher guidance, and student reflection.
              </p>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <p className="text-sm font-medium text-green-900 mb-1">Activity Example:</p>
                <p className="text-green-800">Implement a three-stage feedback process where students receive AI comments, discuss them in small groups, and then meet with the teacher to develop improvement strategies.</p>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Verification</h3>
              <p className="mb-4">
                Maintain human oversight of AI assessment for accuracy and fairness.
              </p>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <p className="text-sm font-medium text-green-900 mb-1">Activity Example:</p>
                <p className="text-green-800">Regularly review a sample of AI-assessed work to verify alignment with learning objectives and identify potential biases or limitations in the AI feedback.</p>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Editing & Iteration</h3>
              <p className="mb-4">
                Use AI feedback as a starting point for revision and improvement.
              </p>
              <div className="bg-green-50 p-4 rounded-lg mb-4">
                <p className="text-sm font-medium text-green-900 mb-1">Activity Example:</p>
                <p className="text-green-800">Have students submit work for AI pre-assessment, revise based on feedback, and then submit final versions with reflections on how they incorporated or challenged the AI suggestions.</p>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Reflection</h3>
              <p className="mb-4">
                Encourage metacognitive analysis of both the assessment content and process.
              </p>
              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <p className="text-sm font-medium text-green-900 mb-1">Activity Example:</p>
                <p className="text-green-800">Ask students to compare AI feedback with teacher feedback, reflecting on the different perspectives and what they reveal about learning objectives and assessment criteria.</p>
              </div>
            </section>

            <hr className="my-8 border-gray-200" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ethical Considerations and Best Practices</h2>
              <p className="mb-4">
                Implementing AI-assisted assessment requires careful attention to several key concerns:
              </p>
              <ol className="list-decimal pl-6 mb-6 space-y-2">
                <li><strong>Transparency:</strong> Be open with students about when and how AI is used in assessment</li>
                <li><strong>Equity:</strong> Regularly audit AI tools for potential biases affecting different student groups</li>
                <li><strong>Privacy:</strong> Ensure student data is protected and used only for educational purposes</li>
                <li><strong>Agency:</strong> Position AI as a tool that supports rather than replaces human judgment</li>
                <li><strong>Accessibility:</strong> Verify that AI assessment tools work for students with diverse needs</li>
              </ol>
            </section>

            <hr className="my-8 border-gray-200" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Looking Forward</h2>
              <p className="mb-4">
                The future of AI-assisted assessment isn't about replacing teacher judgment—it's about creating an "augmented professor" model where AI handles routine aspects of assessment while educators focus on the complex, nuanced elements that require human insight. By thoughtfully integrating these tools, teachers can provide more timely, detailed, and personalized feedback while reclaiming time for the human connections that remain at the heart of effective education.
              </p>
            </section>

            <hr className="my-8 border-gray-200" />

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Works Cited</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <ul className="space-y-3 text-sm">
                  <li>
                    "AI-Assisted Grading: A Magic Wand or a Pandora's Box?" <em>MIT Sloan Teaching & Learning Technologies</em>, 9 May 2024, 
                    <a href="https://mitsloanedtech.mit.edu/2024/05/09/ai-assisted-grading-a-magic-wand-or-a-pandoras-box/" 
                       className="text-indigo-600 hover:text-indigo-800 underline ml-1" 
                       target="_blank" 
                       rel="noopener noreferrer">
                      mitsloanedtech.mit.edu/2024/05/09/ai-assisted-grading-a-magic-wand-or-a-pandoras-box/
                    </a>
                  </li>
                  <li>
                    Daly, Peter, and Emmanuelle Deglaire. "AI-Assisted Grading: Feedback on a Full-Scale Test at EDHEC." <em>EDHEC Business School</em>, 25 Mar. 2025, 
                    <a href="https://www.edhec.edu/en/research-and-faculty/edhec-vox/ai-assisted-grading-feedback-full-scale-test-edhec-artificial-intelligence" 
                       className="text-indigo-600 hover:text-indigo-800 underline ml-1" 
                       target="_blank" 
                       rel="noopener noreferrer">
                      www.edhec.edu/en/research-and-faculty/edhec-vox/ai-assisted-grading-feedback-full-scale-test-edhec-artificial-intelligence
                    </a>
                  </li>
                  <li>
                    "Assessing Confidence in AI-Assisted Grading of Physics Exams." <em>Physical Review Physics Education Research</em>, vol. 21, no. 1, 7 Apr. 2025, doi:10.1103/PhysRevPhysEducRes.21.010136.
                  </li>
                  <li>
                    "AI-Assisted Assessment of Inquiry Skills in Socioscientific Issue-Based Learning." <em>Journal of Computer Assisted Learning</em>, vol. 40, no. 6, 25 Dec. 2024, doi:10.1111/jcal.13102.
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

export default AIAssistedAssessmentArticle;
