
import React from 'react';

const ArticleFooter = () => {
  return (
    <>
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
    </>
  );
};

export default ArticleFooter;
