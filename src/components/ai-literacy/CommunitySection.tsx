
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Calendar } from 'lucide-react';

const CommunitySection = () => {
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup logic here
    console.log('Newsletter signup:', email);
    setEmail('');
    // You can add toast notification here
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Stay Connected with AI Literacy Community
      </h2>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Newsletter Signup */}
        <Card className="bg-indigo-50 border-indigo-200 flex flex-col h-full">
          <CardContent className="p-8 flex flex-col h-full">
            <div className="flex items-center mb-4">
              <Mail className="w-8 h-8 text-indigo-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">Newsletter Signup</h3>
            </div>
            <p className="text-gray-600 mb-6 flex-grow">
              Get the latest updates on AI literacy developments, new features, and best practices 
              delivered straight to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-4 mt-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
                Subscribe to Newsletter
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Webinar Registration */}
        <Card className="bg-indigo-50 border-indigo-200 flex flex-col h-full">
          <CardContent className="p-8 flex flex-col h-full">
            <div className="flex items-center mb-4">
              <Calendar className="w-8 h-8 text-indigo-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">Upcoming Webinars</h3>
            </div>
            <p className="text-gray-600 mb-4 flex-grow">
              Join our free sessions on AI literacy in education. Learn from experts and 
              connect with fellow educators.
            </p>
            <div className="bg-white p-4 rounded-lg mb-4 border border-indigo-100">
              <div className="text-sm font-medium text-indigo-600 mb-1">Next Session</div>
              <div className="font-semibold text-gray-900 mb-1">
                "Building AI Literacy: A Practical Approach"
              </div>
            </div>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 mt-auto">
              Register for Webinar
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommunitySection;
