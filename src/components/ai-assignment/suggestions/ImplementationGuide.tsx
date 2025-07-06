import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from 'lucide-react';

interface ImplementationGuideProps {
  implementationGuide: string;
  onCopy: () => void;
}

const ImplementationGuide: React.FC<ImplementationGuideProps> = ({
  implementationGuide,
  onCopy
}) => {
  return (
    <Card className="bg-gray-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Implementation Guide</CardTitle>
          <Button 
            onClick={onCopy} 
            variant="ghost" 
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-line text-gray-700">{implementationGuide}</div>
      </CardContent>
    </Card>
  );
};

export default ImplementationGuide;