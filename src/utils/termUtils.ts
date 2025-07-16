export interface ParsedTerm {
  semester: string;
  year: number;
  termCode: string;
  original: string;
  isDefault: boolean;
  sortKey: number;
}

export interface CourseWithTerm {
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
  parsedTerm: ParsedTerm;
}

// Parse various term naming patterns
export function parseTermName(termName: string): ParsedTerm {
  if (!termName || termName.toLowerCase().includes('default')) {
    return {
      semester: 'Unknown',
      year: new Date().getFullYear(),
      termCode: 'DEFAULT',
      original: termName || 'Default Term',
      isDefault: true,
      sortKey: 9999 // Put default terms at the end
    };
  }

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12
  
  // Common patterns to match
  const patterns = [
    // SU/2025, FA/2025, SP/2025
    /^(SU|FA|SP)\/(\d{4})$/i,
    // Summer 2025, Fall 2025, Spring 2025
    /^(Summer|Fall|Spring|Winter)\s+(\d{4})$/i,
    // 2025 Summer, 2025 Fall, 2025 Spring
    /^(\d{4})\s+(Summer|Fall|Spring|Winter)$/i,
    // Fall Semester 2025
    /^(Summer|Fall|Spring|Winter)\s+Semester\s+(\d{4})$/i,
    // 2025-2026 Fall
    /^(\d{4})-(\d{4})\s+(Summer|Fall|Spring|Winter)$/i,
    // Just year: 2025
    /^(\d{4})$/
  ];

  for (const pattern of patterns) {
    const match = termName.match(pattern);
    if (match) {
      let semester = '';
      let year = currentYear;
      
      if (pattern.source.includes('(\\d{4})$')) {
        // Just year pattern
        year = parseInt(match[1]);
        semester = 'Unknown';
      } else if (pattern.source.startsWith('^(\\d{4})')) {
        // Year first patterns
        year = parseInt(match[1]);
        semester = normalizeSemester(match[2] || match[3]);
      } else if (pattern.source.includes('(\\d{4})-(\\d{4})')) {
        // Academic year pattern (2025-2026)
        year = parseInt(match[1]);
        semester = normalizeSemester(match[3]);
      } else {
        // Semester first patterns
        semester = normalizeSemester(match[1]);
        year = parseInt(match[2]);
      }

      const termCode = `${getSemesterCode(semester)}${year}`;
      const sortKey = calculateSortKey(semester, year, currentYear, currentMonth);

      return {
        semester,
        year,
        termCode,
        original: termName,
        isDefault: false,
        sortKey
      };
    }
  }

  // Fallback: try to extract year and guess semester
  const yearMatch = termName.match(/(\d{4})/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1]);
    return {
      semester: 'Unknown',
      year,
      termCode: `UNK${year}`,
      original: termName,
      isDefault: false,
      sortKey: calculateSortKey('Unknown', year, currentYear, currentMonth)
    };
  }

  // Ultimate fallback
  return {
    semester: 'Unknown',
    year: currentYear,
    termCode: 'UNKNOWN',
    original: termName,
    isDefault: true,
    sortKey: 9998
  };
}

function normalizeSemester(semester: string): string {
  const s = semester.toLowerCase();
  if (s.includes('spring') || s === 'sp') return 'Spring';
  if (s.includes('summer') || s === 'su') return 'Summer';
  if (s.includes('fall') || s === 'fa') return 'Fall';
  if (s.includes('winter')) return 'Winter';
  return semester;
}

function getSemesterCode(semester: string): string {
  switch (semester) {
    case 'Spring': return 'SP';
    case 'Summer': return 'SU';
    case 'Fall': return 'FA';
    case 'Winter': return 'WI';
    default: return 'UK';
  }
}

function calculateSortKey(semester: string, year: number, currentYear: number, currentMonth: number): number {
  // Base score: more recent years = lower numbers (higher priority)
  let score = (currentYear - year) * 100;
  
  // Current semester gets highest priority (lowest number)
  const currentSemester = getCurrentSemester(currentMonth);
  if (year === currentYear && semester === currentSemester) {
    return score - 50; // Highest priority
  }
  
  // Future semesters get second priority
  if (year > currentYear || (year === currentYear && getSemesterOrder(semester) > getSemesterOrder(currentSemester))) {
    return score - 25;
  }
  
  // Add semester order within the year
  score += getSemesterOrder(semester);
  
  return score;
}

function getCurrentSemester(month: number): string {
  // This is a rough approximation - institutions may vary
  if (month >= 1 && month <= 5) return 'Spring';
  if (month >= 6 && month <= 8) return 'Summer';
  if (month >= 9 && month <= 12) return 'Fall';
  return 'Spring';
}

function getSemesterOrder(semester: string): number {
  switch (semester) {
    case 'Spring': return 1;
    case 'Summer': return 2;
    case 'Fall': return 3;
    case 'Winter': return 4;
    default: return 5;
  }
}

export function groupCoursesByTerm(courses: any[]): { term: ParsedTerm; courses: CourseWithTerm[] }[] {
  // Parse terms for all courses
  const coursesWithTerms: CourseWithTerm[] = courses.map(course => ({
    ...course,
    parsedTerm: parseTermName(course.term?.name || 'Default Term')
  }));

  // Group by term
  const termGroups = new Map<string, CourseWithTerm[]>();
  
  coursesWithTerms.forEach(course => {
    const termKey = course.parsedTerm.termCode;
    if (!termGroups.has(termKey)) {
      termGroups.set(termKey, []);
    }
    termGroups.get(termKey)!.push(course);
  });

  // Convert to array and sort by term priority
  const groupedTerms = Array.from(termGroups.entries()).map(([termCode, courses]) => ({
    term: courses[0].parsedTerm,
    courses: courses.sort((a, b) => a.name.localeCompare(b.name))
  }));

  // Sort terms by priority (current first, then future, then past)
  return groupedTerms.sort((a, b) => a.term.sortKey - b.term.sortKey);
}

export function getTermDisplayName(term: ParsedTerm): string {
  if (term.isDefault) {
    return term.original;
  }
  
  if (term.semester === 'Unknown') {
    return `${term.year}`;
  }
  
  return `${term.semester} ${term.year}`;
}