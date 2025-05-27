
import React from 'react';
import { Info } from 'lucide-react';

const CanvasDisclaimer = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-sm font-medium text-blue-800 mb-1">Third-Party Integration Notice</h4>
          <p className="text-sm text-blue-700">
            A.L.L.E.N. is an independent application that integrates with Canvas through official APIs. 
            We are not affiliated with or endorsed by Instructure, Inc. or Canvas LMS.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CanvasDisclaimer;
