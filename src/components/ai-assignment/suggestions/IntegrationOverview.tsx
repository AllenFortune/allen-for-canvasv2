import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Download } from 'lucide-react';

interface IntegrationOverviewProps {
  overview: string;
  onCopy: () => void;
  onDownload: () => void;
}

const IntegrationOverview: React.FC<IntegrationOverviewProps> = ({
  overview,
  onCopy,
  onDownload
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-foreground">AI Integration Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed mb-4">{overview}</p>
        <div className="flex gap-2">
          <Button onClick={onCopy} variant="outline" size="sm">
            <Copy className="w-4 h-4 mr-2" />
            Copy All
          </Button>
          <Button onClick={onDownload} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default IntegrationOverview;