export interface Course {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  progress: number;
  category: string;
  duration: string;
  modules: Module[];
}

export interface Module {
  id: string;
  title: string;
  content: string;
  isCompleted: boolean;
}

export interface UserStats {
  completedCourses: number;
  inProgressCourses: number;
  learningHours: number;
  averageScore: number;
}
