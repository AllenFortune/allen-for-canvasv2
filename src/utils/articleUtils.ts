import { articles, Article } from '@/data/articles';

export const getCategoryCount = (categoryName: string): number => {
  return articles.filter(article => article.category === categoryName).length;
};

export const getFeaturedArticles = (): Article[] => {
  return articles.filter(article => article.featured);
};

export const getArticlesByCategory = (categoryName: string): Article[] => {
  return articles.filter(article => article.category === categoryName);
};

export const getAllCategories = (): string[] => {
  const categories = articles.map(article => article.category);
  return [...new Set(categories)];
};

// Add new category for AI Implementation if needed
export const getAvailableCategories = () => {
  return [
    { name: "Learning Theory", icon: "Brain" },
    { name: "Teaching Frameworks", icon: "Lightbulb" },
    { name: "Digital Citizenship", icon: "Shield" },
    { name: "Assessment & Feedback", icon: "BookOpen" },
    { name: "AI Implementation", icon: "Users" }
  ];
};