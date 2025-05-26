
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Bot, ExternalLink, Users, Clock, FileText } from 'lucide-react';

interface Assignment {
  id: number;
  name: string;
  description: string;
  due_at: string | null;
  points_possible: number | null;
  course_id: number;
  html_url: string;
  submission_types: string[];
}

interface Submission {
  id: number;
  user_id: number;
  assignment_id: number;
  submitted_at: string | null;
  graded_at: string | null;
  grade: string | null;
  score: number | null;
  submission_comments: any[] | null;
  body: string | null;
  url: string | null;
  attachments: any[];
  workflow_state: string;
  late: boolean;
  missing: boolean;
  submission_type: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    avatar_url: string | null;
    sortable_name: string;
  };
}

const GradeAssignment = () => {
  const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentSubmissionIndex, setCurrentSubmissionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [gradeInput, setGradeInput] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (courseId && assignmentId) {
      fetchAssignmentDetails();
      fetchSubmissions();
    }
  }, [courseId, assignmentId, user]);

  const fetchAssignmentDetails = async () => {
    if (!user || !courseId || !assignmentId) return;

    try {
      const { data, error } = await supabase.functions.invoke('get-canvas-assignment-details', {
        body: { 
          courseId: parseInt(courseId), 
          assignmentId: parseInt(assignmentId) 
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      
      if (error) throw error;
      
      if (data.assignment) {
        setAssignment(data.assignment);
      }
    } catch (error) {
      console.error('Error fetching assignment details:', error);
    }
  };

  const fetchSubmissions = async () => {
    if (!user || !courseId || !assignmentId) return;

    try {
      const { data, error } = await supabase.functions.invoke('get-canvas-assignment-submissions', {
        body: { 
          courseId: parseInt(courseId), 
          assignmentId: parseInt(assignmentId) 
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      
      if (error) throw error;
      
      if (data.submissions) {
        // Sort submissions by student's sortable name
        const sortedSubmissions = data.submissions.sort((a: Submission, b: Submission) => {
          return (a.user.sortable_name || a.user.name).localeCompare(b.user.sortable_name || b.user.name);
        });
        
        setSubmissions(sortedSubmissions);
        
        // Set initial grade and comment if submission has them
        const firstSubmission = sortedSubmissions[0];
        if (firstSubmission) {
          setGradeInput(firstSubmission.score?.toString() || '');
          setCommentInput(getLatestComment(firstSubmission.submission_comments) || '');
        }
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLatestComment = (comments: any[] | null) => {
    if (!comments || comments.length === 0) return '';
    return comments[comments.length - 1]?.comment || '';
  };

  const getSubmissionStatusBadge = (submission: Submission) => {
    if (submission.workflow_state === 'graded') {
      return <Badge className="bg-green-500">Graded</Badge>;
    } else if (submission.missing) {
      return <Badge variant="destructive">Missing</Badge>;
    } else if (submission.late) {
      return <Badge className="bg-yellow-500">Late</Badge>;
    } else if (submission.submitted_at) {
      return <Badge>Submitted</Badge>;
    } else {
      return <Badge variant="outline">Not Submitted</Badge>;
    }
  };

  const filterSubmissions = () => {
    if (activeTab === 'all') {
      return submissions;
    } else if (activeTab === 'submitted') {
      return submissions.filter(s => s.submitted_at && s.workflow_state !== 'graded');
    } else if (activeTab === 'graded') {
      return submissions.filter(s => s.workflow_state === 'graded');
    } else if (activeTab === 'missing') {
      return submissions.filter(s => s.missing || (!s.submitted_at && s.workflow_state !== 'graded'));
    }
    return submissions;
  };

  const filteredSubmissions = filterSubmissions();
  const currentSubmission = filteredSubmissions[currentSubmissionIndex];

  const handleSubmissionChange = (index: number) => {
    setCurrentSubmissionIndex(index);
    const submission = filteredSubmissions[index];
    setGradeInput(submission.score?.toString() || '');
    setCommentInput(getLatestComment(submission.submission_comments) || '');
  };

  const handleSaveGrade = async () => {
    if (!currentSubmission) return;

    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('grade-canvas-submission', {
        body: { 
          courseId: parseInt(courseId!), 
          assignmentId: parseInt(assignmentId!),
          submissionId: currentSubmission.id,
          grade: gradeInput,
          comment: commentInput
        },
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });
      
      if (error) throw error;
      
      // Update local state
      const updatedSubmissions = [...submissions];
      const originalIndex = submissions.findIndex(s => s.id === currentSubmission.id);
      if (originalIndex !== -1) {
        updatedSubmissions[originalIndex] = {
          ...currentSubmission,
          score: parseFloat(gradeInput) || null,
          workflow_state: 'graded'
        };
        setSubmissions(updatedSubmissions);
      }
      
      console.log('Grade saved successfully');
    } catch (error) {
      console.error('Error saving grade:', error);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading assignment details...</p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-4 mb-6">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/courses/${courseId}`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Course
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">Grade Assignment</h1>
              {assignment && (
                <Button variant="outline" asChild>
                  <a href={assignment.html_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in Canvas
                  </a>
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Assignment Details & Navigation */}
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Assignment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{assignment?.name}</h3>
                      <div className="space-y-2 mt-2">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          Due: {formatDate(assignment?.due_at)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FileText className="w-4 h-4 mr-2" />
                          {assignment?.points_possible || 0} points
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          {submissions.length} submissions
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Submission Tabs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Submissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="submitted">Needs Grading</TabsTrigger>
                      </TabsList>
                    </Tabs>
                    
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredSubmissions.map((submission, index) => (
                        <button
                          key={submission.id}
                          onClick={() => handleSubmissionChange(index)}
                          className={`w-full text-left p-3 rounded-md border ${
                            index === currentSubmissionIndex 
                              ? 'bg-blue-50 border-blue-300' 
                              : 'bg-white hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={submission.user.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">
                                {submission.user.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{submission.user.name}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {getSubmissionStatusBadge(submission)}
                                {submission.workflow_state === 'graded' && (
                                  <span className="text-xs text-gray-500">
                                    {submission.score}/{assignment?.points_possible}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Student Submission and Grading */}
              <div className="lg:col-span-3 space-y-6">
                {currentSubmission ? (
                  <>
                    {/* Student Info */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={currentSubmission.user.avatar_url || undefined} />
                            <AvatarFallback>
                              {currentSubmission.user.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle>{currentSubmission.user.name}</CardTitle>
                            <p className="text-gray-600">{currentSubmission.user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {getSubmissionStatusBadge(currentSubmission)}
                              {currentSubmission.submitted_at && (
                                <span className="text-sm text-gray-600">
                                  Submitted: {formatDate(currentSubmission.submitted_at)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>

                    {/* Submission Content */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Submission</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {currentSubmission.body ? (
                          <div className="prose max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: currentSubmission.body }} />
                          </div>
                        ) : currentSubmission.url ? (
                          <div>
                            <p className="mb-2">Website submission:</p>
                            <a 
                              href={currentSubmission.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {currentSubmission.url}
                            </a>
                          </div>
                        ) : currentSubmission.attachments && currentSubmission.attachments.length > 0 ? (
                          <div>
                            <p className="mb-2">File attachments:</p>
                            <div className="space-y-2">
                              {currentSubmission.attachments.map((attachment: any, index: number) => (
                                <a 
                                  key={index}
                                  href={attachment.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="block p-2 border rounded hover:bg-gray-50"
                                >
                                  {attachment.filename || attachment.display_name}
                                </a>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-600">No submission content available.</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Grading Section */}
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>Grade & Feedback</CardTitle>
                          <Button variant="outline" className="flex items-center gap-2">
                            <Bot className="w-4 h-4" />
                            AI-Assist
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Grade (out of {assignment?.points_possible || 'N/A'})
                          </label>
                          <Input
                            type="number"
                            value={gradeInput}
                            onChange={(e) => setGradeInput(e.target.value)}
                            placeholder="Enter grade"
                            max={assignment?.points_possible || undefined}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Comments</label>
                          <Textarea
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            placeholder="Enter feedback for the student..."
                            rows={4}
                          />
                        </div>
                        <Button 
                          onClick={handleSaveGrade}
                          disabled={saving}
                          className="w-full"
                        >
                          {saving ? 'Saving...' : 'Save Grade'}
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="py-8">
                      <p className="text-center text-gray-600">
                        {submissions.length === 0 
                          ? "No submissions found for this assignment." 
                          : "No submissions match the current filter."}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default GradeAssignment;
