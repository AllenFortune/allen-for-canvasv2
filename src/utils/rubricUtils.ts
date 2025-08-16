import { RubricData, RubricCriterion, RubricLevel } from '@/types/rubric';

export const validateRubricTitle = (title: string): boolean => {
  return title.trim().length >= 3 && title.trim().length <= 100;
};

export const validatePointsPossible = (points: number): boolean => {
  return points > 0 && points <= 1000 && Number.isInteger(points);
};

export const calculateTotalPoints = (criteria: RubricCriterion[]): number => {
  return criteria.reduce((total, criterion) => {
    const maxPoints = Math.max(...criterion.levels.map(level => level.points));
    return total + maxPoints;
  }, 0);
};

export const validateRubricCriterion = (criterion: RubricCriterion): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!criterion.name?.trim()) {
    errors.push('Criterion name is required');
  }

  if (!criterion.description?.trim()) {
    errors.push('Criterion description is required');
  }

  if (!criterion.levels || criterion.levels.length === 0) {
    errors.push('At least one performance level is required');
  } else {
    criterion.levels.forEach((level, index) => {
      if (!level.name?.trim()) {
        errors.push(`Level ${index + 1} name is required`);
      }
      if (!level.description?.trim()) {
        errors.push(`Level ${index + 1} description is required`);
      }
      if (typeof level.points !== 'number' || level.points < 0) {
        errors.push(`Level ${index + 1} must have valid points`);
      }
    });

    // Check for duplicate point values
    const pointValues = criterion.levels.map(level => level.points);
    const uniquePoints = new Set(pointValues);
    if (uniquePoints.size !== pointValues.length) {
      errors.push('Performance levels cannot have duplicate point values');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateCompleteRubric = (rubric: RubricData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!validateRubricTitle(rubric.title)) {
    errors.push('Rubric title must be between 3 and 100 characters');
  }

  if (!validatePointsPossible(rubric.pointsPossible)) {
    errors.push('Points possible must be a positive integer between 1 and 1000');
  }

  if (!rubric.criteria || rubric.criteria.length === 0) {
    errors.push('At least one criterion is required');
  } else {
    rubric.criteria.forEach((criterion, index) => {
      const validation = validateRubricCriterion(criterion);
      if (!validation.isValid) {
        errors.push(`Criterion ${index + 1}: ${validation.errors.join(', ')}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const generateRubricTitle = (assignment?: any, fallback = 'Assignment Rubric'): string => {
  if (assignment?.title) {
    return `${assignment.title} Rubric`;
  }
  return fallback;
};

export const formatRubricForCanvas = (rubric: RubricData) => {
  return rubric.criteria.map((criterion) => ({
    description: criterion.name,
    long_description: criterion.description,
    points: criterion.points,
    criterion_use_range: false,
    ratings: criterion.levels.map((level) => ({
      description: level.name,
      long_description: level.description,
      points: level.points
    }))
  }));
};

export const sortRubricLevelsByPoints = (levels: RubricLevel[]): RubricLevel[] => {
  return [...levels].sort((a, b) => b.points - a.points);
};

export const createDefaultRubricCriterion = (name: string, pointsPossible: number): RubricCriterion => {
  const points = Math.max(1, Math.floor(pointsPossible / 4));
  
  return {
    name,
    description: `Assessment criteria for ${name.toLowerCase()}`,
    points: pointsPossible,
    levels: [
      {
        name: 'Excellent',
        description: 'Exceeds expectations',
        points: pointsPossible
      },
      {
        name: 'Good',
        description: 'Meets expectations',
        points: Math.floor(pointsPossible * 0.75)
      },
      {
        name: 'Satisfactory',
        description: 'Approaches expectations',
        points: Math.floor(pointsPossible * 0.5)
      },
      {
        name: 'Needs Improvement',
        description: 'Below expectations',
        points: 0
      }
    ]
  };
};