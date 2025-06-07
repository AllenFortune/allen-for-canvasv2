
import React from 'react';

const FrameworkComponents = () => {
  return (
    <>
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
    </>
  );
};

export default FrameworkComponents;
