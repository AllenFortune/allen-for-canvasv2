
export interface Course {
  id: number;
  name: string;
  course_code: string;
  workflow_state: string;
  start_at: string | null;
  end_at: string | null;
  total_students: number;
  term?: {
    id: number;
    name: string;
    start_at: string | null;
    end_at: string | null;
  };
}

export const isPastCourse = (course: Course): boolean => {
  const now = new Date();
  
  // Check term end date first
  if (course.term?.end_at) {
    const termEndDate = new Date(course.term.end_at);
    if (termEndDate < now) return true;
  }
  
  // Check course end date
  if (course.end_at) {
    const courseEndDate = new Date(course.end_at);
    if (courseEndDate < now) return true;
  }
  
  // Check workflow state for concluded courses
  if (course.workflow_state === 'completed' || course.workflow_state === 'concluded') {
    return true;
  }
  
  return false;
};

export const isCurrentCourse = (course: Course): boolean => {
  return course.workflow_state === 'available' && !isPastCourse(course);
};

export const filterCourses = (courses: Course[], favoriteCourses: Course[], filter: string): Course[] => {
  let filtered = courses;
  
  switch (filter) {
    case 'all':
      filtered = courses;
      break;
    case 'current':
      filtered = courses.filter(course => isCurrentCourse(course));
      break;
    case 'past':
      filtered = courses.filter(course => isPastCourse(course));
      break;
    case 'active':
      filtered = courses.filter(course => course.workflow_state === 'available');
      break;
    case 'unpublished':
      filtered = courses.filter(course => course.workflow_state === 'unpublished');
      break;
    case 'favorites':
      filtered = favoriteCourses;
      break;
    default:
      filtered = courses;
  }
  
  return filtered;
};

// Session cache to avoid repeated auth calls
let sessionCache: { token: string | null; expiry: number } | null = null;

export const getCachedSession = async () => {
  const now = Date.now();
  
  // Check if we have a valid cached session (5 minutes cache)
  if (sessionCache && sessionCache.expiry > now) {
    return { data: { session: { access_token: sessionCache.token } }, error: null };
  }
  
  // Get fresh session
  const { supabase } = await import('@/integrations/supabase/client');
  const sessionResult = await supabase.auth.getSession();
  
  if (sessionResult.data.session?.access_token) {
    // Cache for 5 minutes
    sessionCache = {
      token: sessionResult.data.session.access_token,
      expiry: now + 5 * 60 * 1000
    };
  }
  
  return sessionResult;
};

// Retry wrapper for API calls
export const withRetry = async <T>(
  fn: () => Promise<T>,
  retries: number = 2,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying operation, ${retries} attempts remaining...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};
