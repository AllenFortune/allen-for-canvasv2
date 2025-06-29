
import React from 'react';
import DashboardCard from './DashboardCard';
import { BookText } from 'lucide-react';

interface DashboardCardsGridProps {
  isCanvasConnected: boolean;
}

const DashboardCardsGrid = ({ isCanvasConnected }: DashboardCardsGridProps) => {
  const cards = [
    {
      title: "Courses",
      description: "Manage your Canvas courses",
      linkTo: "/courses",
      buttonText: "View Courses"
    },
    {
      title: "Needs Grading",
      description: "View all assignments that need grading",
      linkTo: "/assignments", 
      buttonText: "View Assignments",
      disabled: !isCanvasConnected
    },
    {
      title: "AI Literacy Tool",
      description: "Transform assignments with DIVER framework AI integration",
      linkTo: "/ai-assignment-integration",
      buttonText: "Launch Tool",
      icon: BookText,
      buttonColor: "bg-indigo-600 hover:bg-indigo-700"
    },
    {
      title: "Settings",
      description: "Manage your account and Canvas integration",
      linkTo: "/settings",
      buttonText: "View Settings"
    }
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <DashboardCard
          key={index}
          title={card.title}
          description={card.description}
          linkTo={card.linkTo}
          buttonText={card.buttonText}
          disabled={card.disabled}
          icon={card.icon}
          buttonColor={card.buttonColor}
        />
      ))}
    </div>
  );
};

export default DashboardCardsGrid;
