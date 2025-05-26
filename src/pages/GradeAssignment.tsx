
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
import { ArrowLeft, Bot } from 'lucide-react';

interface Assignment {
  id: number;
  name: string;
  description: string;
  due_at: string | null;
  points_possible: number | null;
  course_id: number;
}

interface Submission {
  id: number;
  user_id: number;
  assignment_id: number;
  submitted_at: string | null;
  grade: string | null;
  score: number | null;
  submission_comments: string | null;
  body: string | null;
  user: {
    name: string;
    email: string;
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
        setSubmissions(data.submissions);
        // Set initial grade and comment if submission has them
        const firstSubmission = data.submissions[0];
        if (firstSubmission) {
          setGradeInput(firstSubmission.score?.toString() || '');
          setCommentInput(firstSubmission.submission_comments || '');
        }
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentSubmission = submissions[currentSubmissionIndex];

  const handleSubmissionChange = (index: number) => {
    setCurrentSubmissionIndex(index);
    const submission = submissions[index];
    setGradeInput(submission.score?.toString() || '');
    setCommentInput(submission.submission_comments || '');
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
      updatedSubmissions[currentSubmissionIndex] = {
        ...currentSubmission,
        score: parseFloat(gradeInput) || null,
        submission_comments: commentInput
      };
      setSubmissions(updatedSubmissions);
      
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Assignment Details */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Assignment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{assignment?.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">{assignment?.description}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm"><strong>Due:</strong> {formatDate(assignment?.due_at)}</p>
                      <p className="text-sm"><strong>Points:</strong> {assignment?.points_possible || 'Ungraded'}</p>
                      <p className="text-sm"><strong>Submissions:</strong> {submissions.length}</p>
                    </div>

                    {/* Student Navigation */}
                    {submissions.length > 1 && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold">Students:</p>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {submissions.map((submission, index) => (
                            <button
                              key={submission.id}
                              onClick={() => handleSubmissionChange(index)}
                              className={`w-full text-left text-sm p-2 rounded ${
                                index === currentSubmissionIndex 
                                  ? 'bg-blue-100 border-blue-300' 
                                  : 'bg-gray-50 hover:bg-gray-100'
                              }`}
                            >
                              {submission.user.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Student Submission and Grading */}
              <div className="lg:col-span-2 space-y-6">
                {currentSubmission ? (
                  <>
                    {/* Student Info */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Student: {currentSubmission.user.name}</CardTitle>
                        <p className="text-gray-600">{currentSubmission.user.email}</p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">
                          Submitted: {formatDate(currentSubmission.submitted_at)}
                        </p>
                      </CardContent>
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
                      <p className="text-center text-gray-600">No submissions found for this assignment.</p>
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
