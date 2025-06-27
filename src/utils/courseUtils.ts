
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

// Get the current academic semester based on the current date
export const getCurrentAcademicSemester = (): string => {
  const now = new Date();
  const month = now.getMonth() + 1; // getMonth() returns 0-11, so add 1
  const year = now.getFullYear();
  
  let semesterCode: string;
  let semesterYear: number;
  
  if (month >= 8 && month <= 12) {
    // August-December: Fall semester
    semesterCode = 'FA';
    semesterYear = year;
  } else if (month >= 1 && month <= 5) {
    // January-May: Spring semester
    semesterCode = 'SP';
    semesterYear = year;
  } else {
    // June-July: Summer semester
    semesterCode = 'SU';
    semesterYear = year;
  }
  
  console.log(`Current academic semester determined: ${semesterCode}/${semesterYear} (current month: ${month})`);
  return `${semesterCode}/${semesterYear}`;
};

// Check if a term name matches the current academic semester
export const isCurrentSemesterTerm = (termName: string): boolean => {
  if (!termName) return false;
  
  const currentSemester = getCurrentAcademicSemester();
  console.log(`Checking if term "${termName}" matches current semester "${currentSemester}"`);
  
  // Check for various term name formats that might contain the semester
  const termUpper = termName.toUpperCase();
  const semesterUpper = currentSemester.toUpperCase();
  
  // Direct match (e.g., "SU/2025")
  if (termUpper.includes(semesterUpper)) {
    console.log(`✓ Term "${termName}" matches current semester (direct match)`);
    return true;
  }
  
  // Reverse format match (e.g., "2025/SU")
  const [semCode, semYear] = currentSemester.split('/');
  const reverseFormat = `${semYear}/${semCode}`;
  if (termUpper.includes(reverseFormat.toUpperCase())) {
    console.log(`✓ Term "${termName}" matches current semester (reverse format)`);
    return true;
  }
  
  // Check for full semester names
  const semesterNames = {
    'FA': ['FALL', 'AUTUMN'],
    'SP': ['SPRING'],
    'SU': ['SUMMER']
  };
  
  const currentSemesterNames = semesterNames[semCode as keyof typeof semesterNames] || [];
  const currentYear = semYear;
  
  for (const semesterName of currentSemesterNames) {
    if (termUpper.includes(semesterName) && termUpper.includes(currentYear)) {
      console.log(`✓ Term "${termName}" matches current semester (full name match: ${semesterName} ${currentYear})`);
      return true;
    }
  }
  
  console.log(`✗ Term "${termName}" does not match current semester`);
  return false;
};

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
  console.log(`Checking if course "${course.name}" (ID: ${course.id}) is current...`);
  console.log(`Course workflow_state: ${course.workflow_state}`);
  console.log(`Course term: ${course.term ? JSON.stringify(course.term, null, 2) : 'No term data'}`);
  
  // First check if the course is available/active
  if (course.workflow_state !== 'available') {
    console.log(`✗ Course "${course.name}" is not current (workflow_state: ${course.workflow_state})`);
    return false;
  }
  
  // Don't include past courses
  if (isPastCourse(course)) {
    console.log(`✗ Course "${course.name}" is not current (marked as past course)`);
    return false;
  }
  
  // Check if the course term matches the current academic semester
  if (course.term?.name && isCurrentSemesterTerm(course.term.name)) {
    console.log(`✓ Course "${course.name}" is current (term matches current semester)`);
    return true;
  }
  
  // If no term data or term doesn't match current semester, it's not current
  console.log(`✗ Course "${course.name}" is not current (term doesn't match current semester)`);
  return false;
};

export const filterCourses = (courses: Course[], favoriteCourses: Course[], filter: string): Course[] => {
  console.log(`Filtering ${courses.length} courses with filter: ${filter}`);
  
  let filtered = courses;
  
  switch (filter) {
    case 'all':
      filtered = courses;
      break;
    case 'current':
      filtered = courses.filter(course => isCurrentCourse(course));
      console.log(`Current courses filter result: ${filtered.length} courses`);
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
  
  console.log(`Filter "${filter}" returned ${filtered.length} courses`);
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
