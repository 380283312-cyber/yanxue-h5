import coursesData from "./courses.json";

export interface Course {
  name: string;
  classify: string;
  classify_code: string;
  days: string;
  fee: string;
  crowd: string;
  cover: string;
  introduction: string;
  target: string;
}

export const courses: Course[] = coursesData.courses as Course[];
