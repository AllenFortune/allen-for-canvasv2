
import { useState, useEffect } from 'react';

export const useFavoriteCourses = () => {
  const [favoriteCourses, setFavoriteCourses] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Load favorites from localStorage on mount
    const saved = localStorage.getItem('favoriteCourses');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFavoriteCourses(new Set(parsed));
      } catch (error) {
        console.error('Error parsing favorite courses:', error);
      }
    }
  }, []);

  const toggleFavorite = (courseId: number) => {
    setFavoriteCourses(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(courseId)) {
        newFavorites.delete(courseId);
      } else {
        newFavorites.add(courseId);
      }
      
      // Save to localStorage
      localStorage.setItem('favoriteCourses', JSON.stringify(Array.from(newFavorites)));
      
      return newFavorites;
    });
  };

  const isFavorite = (courseId: number) => favoriteCourses.has(courseId);

  return {
    favoriteCourses: Array.from(favoriteCourses),
    toggleFavorite,
    isFavorite
  };
};
