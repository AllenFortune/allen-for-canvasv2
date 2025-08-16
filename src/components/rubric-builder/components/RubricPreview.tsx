import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RubricData } from '@/types/rubric';

interface RubricPreviewProps {
  rubric: RubricData;
  title: string;
  onTitleChange: (title: string) => void;
}

const RubricPreview: React.FC<RubricPreviewProps> = ({
  rubric,
  title,
  onTitleChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Generated Rubric</span>
          <Badge variant="secondary">{rubric.rubricType}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Title</label>
          <Input 
            value={title} 
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Rubric title"
          />
        </div>

        {rubric.criteria?.map((criterion: any, index: number) => (
          <div key={index} className="space-y-2">
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium">{criterion.name}</h4>
              <p className="text-sm text-muted-foreground">{criterion.description}</p>
              
              <div className="grid gap-2">
                {criterion.levels?.map((level: any, levelIndex: number) => (
                  <div key={levelIndex} className="flex items-start gap-2 p-2 bg-muted/50 rounded">
                    <Badge variant="outline">{level.points} pts</Badge>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{level.name}</div>
                      <div className="text-xs text-muted-foreground">{level.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RubricPreview;