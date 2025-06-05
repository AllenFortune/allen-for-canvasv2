
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/hooks/use-toast";
import { Building2, Users, GraduationCap } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

const institutionalSchema = z.object({
  organizationName: z.string().min(2, "Organization name is required"),
  contactPerson: z.string().min(2, "Contact person name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  educationLevel: z.string().min(1, "Please select an education level"),
  numberOfTeachers: z.string().min(1, "Please select the number of teachers"),
  lmsSystem: z.string().min(1, "Please select your LMS"),
  currentChallenges: z.string().min(10, "Please describe your current challenges"),
  implementationTimeline: z.string().min(1, "Please select an implementation timeline"),
  budgetRange: z.string().optional(),
  additionalRequirements: z.string().optional(),
});

type InstitutionalFormData = z.infer<typeof institutionalSchema>;

const InstitutionalInquiry = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<InstitutionalFormData>({
    resolver: zodResolver(institutionalSchema),
    defaultValues: {
      organizationName: "",
      contactPerson: "",
      email: "",
      phone: "",
      educationLevel: "",
      numberOfTeachers: "",
      lmsSystem: "",
      currentChallenges: "",
      implementationTimeline: "",
      budgetRange: "",
      additionalRequirements: "",
    },
  });

  const handleSubmit = async (data: InstitutionalFormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: { ...data, type: 'institutional' }
      });

      if (error) throw error;

      toast({
        title: "Inquiry submitted successfully!",
        description: "We'll get back to you within 24 hours with a custom quote.",
      });

      form.reset();
    } catch (error) {
      console.error('Error sending inquiry:', error);
      toast({
        title: "Error submitting inquiry",
        description: "Please try again later or email us directly at support@allengradeassist.com",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Institutional Pricing Inquiry
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tell us about your institution's needs and we'll provide a custom quote tailored to your requirements.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="w-6 h-6 mr-2" />
                Institution Information
              </CardTitle>
              <CardDescription>
                Help us understand your organization and grading needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="organizationName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your school or institution name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactPerson"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Person *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="your.email@institution.edu" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Institution Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="educationLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Education Level *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select education level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="k-12">K-12 School District</SelectItem>
                              <SelectItem value="elementary">Elementary School</SelectItem>
                              <SelectItem value="middle">Middle School</SelectItem>
                              <SelectItem value="high">High School</SelectItem>
                              <SelectItem value="community-college">Community College</SelectItem>
                              <SelectItem value="university">University</SelectItem>
                              <SelectItem value="training">Training Organization</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="numberOfTeachers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Teachers/Faculty *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select number of teachers" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1-10">1-10 teachers</SelectItem>
                              <SelectItem value="11-25">11-25 teachers</SelectItem>
                              <SelectItem value="26-50">26-50 teachers</SelectItem>
                              <SelectItem value="51-100">51-100 teachers</SelectItem>
                              <SelectItem value="101-250">101-250 teachers</SelectItem>
                              <SelectItem value="250+">250+ teachers</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="lmsSystem"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Learning Management System *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your LMS" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="canvas">Canvas</SelectItem>
                            <SelectItem value="blackboard">Blackboard</SelectItem>
                            <SelectItem value="moodle">Moodle</SelectItem>
                            <SelectItem value="schoology">Schoology</SelectItem>
                            <SelectItem value="google-classroom">Google Classroom</SelectItem>
                            <SelectItem value="brightspace">Brightspace (D2L)</SelectItem>
                            <SelectItem value="sakai">Sakai</SelectItem>
                            <SelectItem value="multiple">Multiple Systems</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="none">No LMS Currently</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currentChallenges"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Grading Challenges *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your current pain points with grading assignments, time constraints, consistency issues, etc."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="implementationTimeline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Implementation Timeline *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="When do you need this?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="immediate">Immediately</SelectItem>
                              <SelectItem value="1-month">Within 1 month</SelectItem>
                              <SelectItem value="3-months">Within 3 months</SelectItem>
                              <SelectItem value="6-months">Within 6 months</SelectItem>
                              <SelectItem value="next-semester">Next semester</SelectItem>
                              <SelectItem value="next-year">Next academic year</SelectItem>
                              <SelectItem value="exploring">Just exploring options</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="budgetRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget Range (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select budget range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="under-5k">Under $5,000</SelectItem>
                              <SelectItem value="5k-15k">$5,000 - $15,000</SelectItem>
                              <SelectItem value="15k-50k">$15,000 - $50,000</SelectItem>
                              <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                              <SelectItem value="100k+">$100,000+</SelectItem>
                              <SelectItem value="flexible">Flexible based on value</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="additionalRequirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Requirements (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Any specific features, integrations, or requirements you need? (e.g., SSO, custom branding, specific compliance needs)"
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-lg py-3">
                    {isSubmitting ? "Submitting..." : "Request Custom Quote"}
                  </Button>

                  <div className="text-center text-sm text-gray-500">
                    <p>We'll get back to you within 24 hours with a personalized quote.</p>
                    <p>Questions? Email us directly at <a href="mailto:support@allengradeassist.com" className="text-indigo-600 hover:underline">support@allengradeassist.com</a></p>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default InstitutionalInquiry;
