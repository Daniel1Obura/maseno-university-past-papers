import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { API_BASE_URL } from '../constants/api';
import { Paper } from '../data/papers';
import { fallbackSchools, School } from '../data/schools';

const MIN_REFRESH_INTERVAL_MS = 15_000;
const REQUEST_TIMEOUT_MS = 10_000;

type ApiSchool = {
  id: number;
  name: string;
};

type ApiDepartmentRow = {
  id: number;
  name: string;
  school_name: string;
};

type ApiPaper = {
  id: number;
  code: string;
  title: string;
  year: number;
  semester: string;
  type: string;
  pdf_url: string | null;
  department_id: number;
  department_name: string;
  school_id: number;
  school_name: string;
  created_at: string;
};

async function fetchJson<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export function usePapers() {
  const [apiSchools, setApiSchools] = useState<ApiSchool[] | null>(null);
  const [apiDepartments, setApiDepartments] = useState<ApiDepartmentRow[] | null>(null);
  const [apiPapers, setApiPapers] = useState<Paper[] | null>(null);

  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isFetching = useRef(false);
  const lastFetchedAt = useRef(0);

  const refresh = useCallback(async (options?: { force?: boolean }) => {
    if (isFetching.current) {
      return;
    }

    if (
      !options?.force &&
      Date.now() - lastFetchedAt.current < MIN_REFRESH_INTERVAL_MS
    ) {
      return;
    }

    isFetching.current = true;

    try {
        const [schoolsResult, departmentsResult, papersResult] =
        await Promise.allSettled([
          fetchJson<ApiSchool[]>('/schools'),
          fetchJson<ApiDepartmentRow[]>('/departments'),
          fetchJson<ApiPaper[]>('/papers'),
        ]);

      if (schoolsResult.status === 'fulfilled') {
        setApiSchools(schoolsResult.value);
      } else {
        console.error('Error loading schools:', schoolsResult.reason);
      }

      if (departmentsResult.status === 'fulfilled') {
        setApiDepartments(departmentsResult.value);
      } else {
        console.error('Error loading departments:', departmentsResult.reason);
      }

      if (papersResult.status === 'fulfilled') {
        const formatted: Paper[] = papersResult.value.map((paper) => ({
          id: paper.id,
          code: paper.code,
          title: paper.title,
          year: String(paper.year),
          semester: paper.semester,
          type: paper.type,
          pdf_url: paper.pdf_url,
          department_id: paper.department_id,
          departmentName: paper.department_name,
          schoolName: paper.school_name,
          created_at: paper.created_at,
        }));

        setApiPapers(formatted);
        lastFetchedAt.current = Date.now();
      } else {
        console.error('Error loading papers:', papersResult.reason);
      }
    } finally {
      isFetching.current = false;
      setInitialLoading(false);
    }
  }, []);

  const pullToRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh({ force: true });
    setRefreshing(false);
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();

      const subscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          refresh();
        }
      });

      return () => subscription.remove();
    }, [refresh])
  );

  const allPapers: Paper[] = useMemo(() => {
    return apiPapers ?? [];
  }, [apiPapers]);

  const displaySchools: School[] = useMemo(() => {
    const base =
      apiSchools && apiSchools.length > 0
        ? apiSchools.map((dbSchool) => {
            const uiSchool = fallbackSchools.find((s) => s.name === dbSchool.name);
            return {
              name: dbSchool.name,
              icon: uiSchool?.icon ?? 'school-outline',
              colors: uiSchool?.colors ?? (['#0756D9', '#4285F4'] as [string, string]),
              papers: 0,
            };
          })
        : fallbackSchools;

    return base.map((school) => ({
      ...school,
      papers: allPapers.filter((paper) => paper.schoolName === school.name).length,
    }));
  }, [apiSchools, allPapers]);

  const recentPapers: Paper[] = useMemo(() => {
    return [...allPapers]
      .filter((paper) => paper.created_at)
      .sort(
        (a, b) =>
          new Date(b.created_at as string).getTime() -
          new Date(a.created_at as string).getTime()
      )
      .slice(0, 3);
  }, [allPapers]);

  const getPapersForSchool = useCallback(
    (schoolName: string): Paper[] => {
      return allPapers.filter((paper) => paper.schoolName === schoolName);
    },
    [allPapers]
  );

    const getDepartmentsForSchool = useCallback(
    (schoolName: string): { name: string; count: number }[] => {
      const departmentNames = (apiDepartments ?? [])
        .filter((department) => department.school_name === schoolName)
        .map((department) => department.name);

      return departmentNames
        .map((name) => ({
          name,
          count: allPapers.filter(
            (paper) =>
              paper.schoolName === schoolName && paper.departmentName === name
          ).length,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    },
    [apiDepartments, allPapers]
  );

  return {
    schools: displaySchools,
    allPapers,
    recentPapers,
    getPapersForSchool,
    getDepartmentsForSchool,
    loading: initialLoading,
    refreshing,
    refresh: pullToRefresh,
    usingFallback: apiSchools === null && !initialLoading,
  };
}

