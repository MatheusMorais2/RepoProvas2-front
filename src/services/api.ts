import axios from "axios";

const baseAPI = axios.create({
  baseURL: "http://localhost:5000/",
});

interface UserData {
  email: string;
  password: string;
}

function getConfig(token: string) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

async function signUp(signUpData: UserData) {
  await baseAPI.post("/sign-up", signUpData);
}

async function signIn(signInData: UserData) {
  return baseAPI.post<{ token: string }>("/sign-in", signInData);
}

export interface Term {
  id: number;
  number: number;
}

export interface Discipline {
  id: number;
  name: string;
  teacherDisciplines: TeacherDisciplines[];
  term: Term;
}

export interface TeacherDisciplines {
  id: number;
  discipline: Discipline;
  teacher: Teacher;
  tests: Test[];
}

export interface Teacher {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Test {
  id: number;
  name: string;
  pdfUrl: string;
  category: Category;
  _count: { View: number };
}

export interface CreateTest {
  name: string;
  pdfUrl: string;
  category: string;
  teacher: string;
  discipline: string;
}

export type TestByDiscipline = Term & {
  disciplines: Discipline[];
};

export type TestByTeacher = TeacherDisciplines & {
  teacher: Teacher;
  disciplines: Discipline[];
  tests: Test[];
};

async function getTestsByDiscipline(token: string, searchQuery: string | null) {
  const config = getConfig(token);
  const testsByDiscipline = await baseAPI.get<{ tests: TestByDiscipline[] }>(
    `/tests?groupBy=disciplines${searchQuery ? `&search=${searchQuery}` : ""}`,
    config
  );
  console.log("testByDiscipline.data: ", testsByDiscipline.data);
  return testsByDiscipline;
}

async function getTestsByTeacher(token: string, searchQuery: string | null) {
  const config = getConfig(token);
  const testsByTeacher = await baseAPI.get<{ tests: TestByTeacher[] }>(
    `/tests?groupBy=teachers${searchQuery ? `&search=${searchQuery}` : ""}`,
    config
  );
  console.log("testsByTeacher: ", testsByTeacher.data);
  return testsByTeacher;
}

async function getCategories(token: string) {
  const config = getConfig(token);
  return baseAPI.get<{ categories: Category[] }>("/categories", config);
}

async function getDisciplines(token: string) {
  const config = getConfig(token);
  return baseAPI.get("/disciplines", config);
}

async function createTest(token: string, testData: CreateTest) {
  const config = getConfig(token);
  return baseAPI.post("/tests", testData, config);
}

async function increaseViews(token: string, testId: number) {
  const config = getConfig(token);
  return baseAPI.post(`/tests/views/${testId}`, "", config);
}

async function getViews(token: string, testId: number) {
  const config = getConfig(token);
  const returnGetViews = await baseAPI.get(`/tests/views/${testId}`, config);
  return returnGetViews;
}

const api = {
  signUp,
  signIn,
  getTestsByDiscipline,
  getTestsByTeacher,
  getCategories,
  getDisciplines,
  createTest,
  increaseViews,
  getViews,
};

export default api;
