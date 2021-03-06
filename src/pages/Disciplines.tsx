import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Link,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import api, {
  Category,
  Discipline,
  TeacherDisciplines,
  Test,
  TestByDiscipline,
} from "../services/api";
import SendIcon from "@mui/icons-material/Send";
import { AxiosError } from "axios";
import useAlert from "../hooks/useAlert";
import { showMessage } from "../services/showMessage";

function Disciplines() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { setMessage } = useAlert();
  const [terms, setTerms] = useState<TestByDiscipline[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, SetSearch] = useState<string>("");

  useEffect(() => {
    async function loadPage() {
      if (!token) return;
      try {
        const { data: testsData } = await api.getTestsByDiscipline(token, "");
        setTerms(testsData.tests);
        const { data: categoriesData } = await api.getCategories(token);
        setCategories(categoriesData.categories);
      } catch (error: Error | AxiosError | any) {
        showMessage(error, setMessage);
      }
    }
    loadPage();
  }, [token]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    SetSearch(e.target.value);
  }

  async function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!token) return;

    try {
      const { data: testsData } = await api.getTestsByDiscipline(token, search);
      setTerms(testsData.tests);

      const { data: categoriesData } = await api.getCategories(token);
      setCategories(categoriesData.categories);

      setMessage({
        type: "success",
        text: `Pesquisa por ${search} completa`,
      });
    } catch (error: Error | AxiosError | any) {
      showMessage(error, setMessage);
    }
  }

  return (
    <>
      <TextField
        sx={{ marginX: "auto", marginBottom: "25px", width: "450px" }}
        label="Pesquise por disciplina"
        onChange={handleChange}
        value={search}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SendIcon onClick={handleSearchSubmit} />
            </InputAdornment>
          ),
        }}
      />
      <Divider sx={{ marginBottom: "35px" }} />
      <Box
        sx={{
          marginX: "auto",
          width: "700px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="contained"
            onClick={() => navigate("/app/disciplinas")}
          >
            Disciplinas
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/app/pessoas-instrutoras")}
          >
            Pessoa Instrutora
          </Button>
          <Button variant="outlined" onClick={() => navigate("/app/adicionar")}>
            Adicionar
          </Button>
        </Box>
        <TermsAccordions categories={categories} terms={terms} />
      </Box>
    </>
  );
}

interface TermsAccordionsProps {
  categories: Category[];
  terms: TestByDiscipline[];
}

function TermsAccordions({ categories, terms }: TermsAccordionsProps) {
  return (
    <Box sx={{ marginTop: "50px" }}>
      {terms.map((term) => (
        <Accordion sx={{ backgroundColor: "#FFF" }} key={term.id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{term.number} Per??odo</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <DisciplinesAccordions
              categories={categories}
              disciplines={term.disciplines}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

interface DisciplinesAccordionsProps {
  categories: Category[];
  disciplines: Discipline[];
}

function DisciplinesAccordions({
  categories,
  disciplines,
}: DisciplinesAccordionsProps) {
  if (disciplines.length === 0)
    return <Typography>Nenhuma prova para esse per??odo...</Typography>;

  return (
    <>
      {disciplines.map((discipline) => (
        <Accordion
          sx={{ backgroundColor: "#FFF", boxShadow: "none" }}
          key={discipline.id}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{discipline.name}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Categories
              categories={categories}
              teachersDisciplines={discipline.teacherDisciplines}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  );
}

interface CategoriesProps {
  categories: Category[];
  teachersDisciplines: TeacherDisciplines[];
}

function Categories({ categories, teachersDisciplines }: CategoriesProps) {
  if (teachersDisciplines.length === 0)
    return <Typography>Nenhuma prova para essa disciplina...</Typography>;

  return (
    <>
      {categories
        .filter(doesCategoryHaveTests(teachersDisciplines))
        .map((category) => (
          <Box key={category.id}>
            <Typography fontWeight="bold">{category.name}</Typography>
            <TeachersDisciplines
              categoryId={category.id}
              teachersDisciplines={teachersDisciplines}
            />
          </Box>
        ))}
    </>
  );
}

interface TeacherDisciplineProps {
  teachersDisciplines: TeacherDisciplines[];
  categoryId: number;
}

function doesCategoryHaveTests(teachersDisciplines: TeacherDisciplines[]) {
  return (category: Category) =>
    teachersDisciplines.filter((teacherDiscipline) =>
      someTestOfCategory(teacherDiscipline.tests, category.id)
    ).length > 0;
}

function someTestOfCategory(tests: Test[], categoryId: number) {
  return tests.some((test) => test.category.id === categoryId);
}

function testOfCategory(test: Test, categoryId: number) {
  return test.category.id === categoryId;
}

function TeachersDisciplines({
  categoryId,
  teachersDisciplines,
}: TeacherDisciplineProps) {
  const testsWithDisciplines = teachersDisciplines.map((teacherDiscipline) => ({
    tests: teacherDiscipline.tests,
    teacherName: teacherDiscipline.teacher.name,
  }));

  return (
    <Tests categoryId={categoryId} testsWithTeachers={testsWithDisciplines} />
  );
}

interface TestsProps {
  testsWithTeachers: { tests: Test[]; teacherName: string }[];
  categoryId: number;
}

function Tests({
  categoryId,
  testsWithTeachers: testsWithDisciplines,
}: TestsProps) {
  const { setMessage } = useAlert();

  const { token } = useAuth();

  async function handleLinkClick(
    e: React.MouseEvent,
    testId: number,
    setViews: React.Dispatch<React.SetStateAction<number>>,
    pdfUrl: string
  ) {
    e.preventDefault();
    try {
      if (!token) return;

      await api.increaseViews(token, testId);
      const views = await api.getViews(token, testId);
      setViews(views.data.views);

      window.open(pdfUrl, "_blank");
    } catch (error: Error | AxiosError | any) {
      showMessage(error, setMessage);
    }
  }
  return (
    <>
      {testsWithDisciplines.map((testsWithDisciplines) =>
        testsWithDisciplines.tests
          .filter((test) => testOfCategory(test, categoryId))
          .map((test) => {
            const [views, setViews] = useState(test._count.View);

            return (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
                key={test.id}
              >
                <Typography key={test.id} color="#878787">
                  <Link
                    href={test.pdfUrl}
                    target="_blank"
                    underline="none"
                    color="inherit"
                    onClick={(e) =>
                      handleLinkClick(e, test.id, setViews, test.pdfUrl)
                    }
                  >{`${test.name} (${testsWithDisciplines.teacherName})`}</Link>
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <VisibilityOutlinedIcon /> {`  ${views}`}
                </Box>
              </Box>
            );
          })
      )}
    </>
  );
}

export default Disciplines;
