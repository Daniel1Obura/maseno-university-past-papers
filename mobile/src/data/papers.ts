import { Ionicons } from '@expo/vector-icons';

export type Department = {
  name: string;
  code: string;
  papers: number;
  icon: keyof typeof Ionicons.glyphMap;
  colors: [string, string];
};

export type Paper = {
  id?: number;
  code: string;
  title: string;
  year: string;
  semester: string;
  type: string;
  pdf_url?: string | null;
  department_id?: number;
  departmentName?: string;
  schoolName?: string;
  created_at?: string;
};

export const departments: Department[] = [
  {
    name: 'Computer Science',
    code: 'CSC',
    papers: 124,
    icon: 'laptop-outline',
    colors: ['#0756D9', '#4285F4'],
  },
  {
    name: 'Information Technology',
    code: 'CIT',
    papers: 98,
    icon: 'desktop-outline',
    colors: ['#D946EF', '#EC4899'],
  },
  {
    name: 'Computer Technology',
    code: 'CPT',
    papers: 76,
    icon: 'hardware-chip-outline',
    colors: ['#0F9D8A', '#20BFA5'],
  },
  {
    name: 'Other Departments',
    code: 'OTHER',
    papers: 42,
    icon: 'school-outline',
    colors: ['#F59E0B', '#F97316'],
  },
];

export const papers: Record<string, Paper[]> = {
  'Computer Science': [
    {
      code: 'CSC 221',
      title: 'Database Systems',
      year: '2025',
      semester: 'Semester 1',
      type: 'Exam',
    },
    {
      code: 'CSC 215',
      title: 'Data Structures and Algorithms',
      year: '2024',
      semester: 'Semester 1',
      type: 'Exam',
    },
    {
      code: 'CSC 225',
      title: 'Operating Systems',
      year: '2025',
      semester: 'Semester 1',
      type: 'CAT',
    },
    {
      code: 'CSC 213',
      title: 'Computer Networks',
      year: '2024',
      semester: 'Semester 2',
      type: 'Exam',
    },
    {
      code: 'CSC 211',
      title: 'Programming Methodology',
      year: '2025',
      semester: 'Semester 2',
      type: 'Exam',
    },
  ],

  'Information Technology': [
    {
      code: 'CIT 214',
      title: 'Computer Networks',
      year: '2024',
      semester: 'Semester 2',
      type: 'Exam',
    },
    {
      code: 'CIT 210',
      title: 'Web Development',
      year: '2025',
      semester: 'Semester 1',
      type: 'Exam',
    },
    {
      code: 'CIT 212',
      title: 'Information Systems',
      year: '2024',
      semester: 'Semester 1',
      type: 'CAT',
    },
    {
      code: 'CIT 216',
      title: 'Systems Analysis and Design',
      year: '2025',
      semester: 'Semester 2',
      type: 'Exam',
    },
  ],

  'Computer Technology': [
    {
      code: 'CPT 210',
      title: 'Computer Hardware',
      year: '2025',
      semester: 'Semester 1',
      type: 'Exam',
    },
    {
      code: 'CPT 214',
      title: 'Digital Electronics',
      year: '2024',
      semester: 'Semester 2',
      type: 'CAT',
    },
    {
      code: 'CPT 216',
      title: 'Computer Architecture',
      year: '2025',
      semester: 'Semester 1',
      type: 'Exam',
    },
    {
      code: 'CPT 220',
      title: 'Microprocessor Systems',
      year: '2024',
      semester: 'Semester 2',
      type: 'Exam',
    },
  ],

  'Other Departments': [
    {
      code: 'SCI 101',
      title: 'Introduction to Science',
      year: '2025',
      semester: 'Semester 1',
      type: 'Exam',
    },
    {
      code: 'MAT 101',
      title: 'Mathematics',
      year: '2024',
      semester: 'Semester 2',
      type: 'Exam',
    },
  ],
};
