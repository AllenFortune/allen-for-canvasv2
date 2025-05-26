
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import GradeAssignmentHeader from '@/components/grading/GradeAssignmentHeader';
import AssignmentDetailsCard from '@/components/grading/AssignmentDetailsCard';
import SubmissionsList from '@/components/grading/SubmissionsList';
import StudentSubmissionView from '@/components/grading/StudentSubmissionView';
import GradingForm from '@/components/grading/GradingForm';

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
            <GradeAssignmentHeader 
              courseId={courseId!} 
              assignment={assignment} 
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Assignment Details & Navigation */}
              <div className="lg:col-span-1 space-y-6">
                <AssignmentDetailsCard 
                  assignment={assignment} 
                  submissionsCount={submissions.length} 
                />
                
                <SubmissionsList
                  submissions={submissions}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  currentSubmissionIndex={currentSubmissionIndex}
                  onSubmissionChange={handleSubmissionChange}
                  assignment={assignment}
                />
              </div>

              {/* Student Submission and Grading */}
              <div className="lg:col-span-3 space-y-6">
                {currentSubmission ? (
                  <>
                    <StudentSubmissionView submission={currentSubmission} />
                    <GradingForm
                      assignment={assignment}
                      gradeInput={gradeInput}
                      setGradeInput={setGradeInput}
                      commentInput={commentInput}
                      setCommentInput={setCommentInput}
                      onSaveGrade={handleSaveGrade}
                      saving={saving}
                    />
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
