
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import AssignmentsLoadingDisplay from "@/components/grading/AssignmentsLoadingDisplay";
import AssignmentsHeader from "@/components/grading/AssignmentsHeader";
import AssignmentCard from "@/components/grading/AssignmentCard";
import EmptyAssignmentsState from "@/components/grading/EmptyAssignmentsState";
import AssignmentsSummary from "@/components/grading/AssignmentsSummary";
import { useAllAssignments } from "@/hooks/useAllAssignments";

interface Assignment {
  id: number;
  name: string;
  course_id: number;
  course_name: string;
  course_code: string;
  due_at: string | null;
  points_possible: number;
  needs_grading_count: number;
  html_url: string;
}

type SortOrder = 'oldest-first' | 'newest-first';

const Assignments = () => {
  const navigate = useNavigate();
  const { assignments, loading, refreshing, handleRefresh, sortAssignments } = useAllAssignments();
  const [sortedAssignments, setSortedAssignments] = useState<Assignment[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('oldest-first');

  useEffect(() => {
    setSortedAssignments(sortAssignments(assignments, sortOrder));
  }, [assignments, sortOrder, sortAssignments]);

  const handleStartGrading = (assignment: Assignment) => {
    navigate(`/courses/${assignment.course_id}/assignments/${assignment.id}/grade`);
  };

  if (loading) {
    return <AssignmentsLoadingDisplay />;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <AssignmentsHeader
              assignmentCount={sortedAssignments.length}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              onRefresh={handleRefresh}
              refreshing={refreshing}
            />

            <div className="space-y-4">
              {sortedAssignments.map((assignment) => (
                <AssignmentCard
                  key={`${assignment.course_id}-${assignment.id}`}
                  assignment={assignment}
                  onStartGrading={handleStartGrading}
                />
              ))}
            </div>

            {sortedAssignments.length === 0 && <EmptyAssignmentsState />}

            <AssignmentsSummary
              assignmentCount={sortedAssignments.length}
              sortOrder={sortOrder}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Assignments;
