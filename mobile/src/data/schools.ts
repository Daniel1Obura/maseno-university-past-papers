import { Ionicons } from '@expo/vector-icons';

export type School = {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: [string, string];
  papers: number;
};

// A palette cycled across schools that don't have a specific color.
const PALETTE: [string, string][] = [
  ['#0756D9', '#4285F4'],
  ['#D946EF', '#EC4899'],
  ['#0F9D8A', '#20BFA5'],
  ['#F59E0B', '#F97316'],
  ['#7C3AED', '#A78BFA'],
  ['#DC2626', '#F87171'],
  ['#059669', '#34D399'],
];

const SCHOOL_NAMES = [
  'School of Agriculture, Food Security and Environmental Sciences',
  'School of Arts and Social Sciences',
  'School of Business and Economics',
  'School of Computing and Informatics',
  'School of Development and Strategic Studies',
  'School of Education',
  'School of Law',
  'School of Mathematics and Actuarial Science',
  'School of Medicine',
  'School of Nursing',
  'School of Pharmacy',
  'School of Physical and Biological Sciences',
  'School of Planning and Architecture',
  'School of Public Health and Community Development',
];

const SCHOOL_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'School of Computing and Informatics': 'laptop-outline',
  'School of Medicine': 'medkit-outline',
  'School of Nursing': 'heart-outline',
  'School of Pharmacy': 'flask-outline',
  'School of Law': 'briefcase-outline',
  'School of Education': 'school-outline',
  'School of Business and Economics': 'trending-up-outline',
  'School of Mathematics and Actuarial Science': 'calculator-outline',
  'School of Physical and Biological Sciences': 'leaf-outline',
  'School of Agriculture, Food Security and Environmental Sciences': 'nutrition-outline',
  'School of Arts and Social Sciences': 'color-palette-outline',
  'School of Development and Strategic Studies': 'analytics-outline',
  'School of Planning and Architecture': 'business-outline',
  'School of Public Health and Community Development': 'people-outline',
};

// This exact list is what the Upload screen's School picker shows.
export const ALL_SCHOOL_NAMES = [...SCHOOL_NAMES, 'Other Departments & Schools'];

export const fallbackSchools: School[] = ALL_SCHOOL_NAMES.map((name, index) => ({
  name,
  icon:
    SCHOOL_ICONS[name] ??
    (name === 'Other Departments & Schools' ? 'ellipsis-horizontal-circle-outline' : 'school-outline'),
  colors: PALETTE[index % PALETTE.length],
  papers: 0,
}));