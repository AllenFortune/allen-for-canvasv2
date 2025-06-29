
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  description: string;
  linkTo: string;
  buttonText: string;
  disabled?: boolean;
  icon?: LucideIcon;
  buttonColor?: string;
}

const DashboardCard = ({ 
  title, 
  description, 
  linkTo, 
  buttonText, 
  disabled = false,
  icon: Icon,
  buttonColor = "bg-gray-900 hover:bg-gray-800"
}: DashboardCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 flex flex-col">
      <div className="flex items-center mb-2">
        {Icon && <Icon className="w-6 h-6 text-indigo-600 mr-2" />}
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600 mb-6 flex-grow">{description}</p>
      <Link to={linkTo}>
        <Button className={`w-full ${buttonColor} text-white`} disabled={disabled}>
          {buttonText} <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </div>
  );
};

export default DashboardCard;
