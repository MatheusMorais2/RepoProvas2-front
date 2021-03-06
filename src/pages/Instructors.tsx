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
  TeacherDisciplines,
  Test,
  TestByTeacher,
} from "../services/api";
import SendIcon from "@mui/icons-material/Send";
import { AxiosError } from "axios";
import useAlert from "../hooks/useAlert";
import { showMessage } from "../services/showMessage";

function Instructors() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [teachersDisciplines, setTeachersDisciplines] = useState<
    TestByTeacher[]
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, SetSearch] = useState<string>("");
  const { setMessage } = useAlert();

  useEffect(() => {
    async function loadPage() {
      if (!token) return;

      const { data: testsData } = await api.getTestsByTeacher(token, "");
      setTeachersDisciplines(testsData.tests);
      const { data: categoriesData } = await api.getCategories(token);
      setCategories(categoriesData.categories);
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
      const { data: testsData } = await api.getTestsByTeacher(token, search);
      setTeachersDisciplines(testsData.tests);

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
        label="Pesquise por pessoa instrutora"
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
            variant="outlined"
            onClick={() => navigate("/app/disciplinas")}
          >
            Disciplinas
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/app/pessoas-instrutoras")}
          >
            Pessoa Instrutora
          </Button>
          <Button variant="outlined" onClick={() => navigate("/app/adicionar")}>
            Adicionar
          </Button>
        </Box>
        <TeachersDisciplinesAccordions
          categories={categories}
          teachersDisciplines={teachersDisciplines}
        />
      </Box>
    </>
  );
}

interface TeachersDisciplinesAccordionsProps {
  teachersDisciplines: TestByTeacher[];
  categories: Category[];
}

function TeachersDisciplinesAccordions({
  categories,
  teachersDisciplines,
}: TeachersDisciplinesAccordionsProps) {
  const teachers = getUniqueTeachers(teachersDisciplines);

  return (
    <Box sx={{ marginTop: "50px" }}>
      {teachers.map((teacher) => (
        <Accordion sx={{ backgroundColor: "#FFF" }} key={teacher}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">{teacher}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {categories
              .filter(doesCategoryHaveTests(teacher, teachersDisciplines))
              .map((category) => (
                <Categories
                  key={category.id}
                  category={category}
                  teacher={teacher}
                  teachersDisciplines={teachersDisciplines}
                />
              ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

function getUniqueTeachers(teachersDisciplines: TestByTeacher[]) {
  return [
    ...new Set(
      teachersDisciplines.map(
        (teacherDiscipline) => teacherDiscipline.teacher.name
      )
    ),
  ];
}

function doesCategoryHaveTests(
  teacher: string,
  teachersDisciplines: TeacherDisciplines[]
) {
  return (category: Category) =>
    teachersDisciplines.filter(
      (teacherDiscipline) =>
        teacherDiscipline.teacher.name === teacher &&
        testOfThisCategory(teacherDiscipline, category)
    ).length > 0;
}

function testOfThisCategory(
  teacherDiscipline: TeacherDisciplines,
  category: Category
) {
  return teacherDiscipline.tests.some(
    (test) => test.category.id === category.id
  );
}

interface CategoriesProps {
  teachersDisciplines: TeacherDisciplines[];
  category: Category;
  teacher: string;
}

function Categories({
  category,
  teachersDisciplines,
  teacher,
}: CategoriesProps) {
  return (
    <>
      <Box sx={{ marginBottom: "8px" }}>
        <Typography fontWeight="bold">{category.name}</Typography>
        {teachersDisciplines
          .filter(
            (teacherDiscipline) => teacherDiscipline.teacher.name === teacher
          )
          .map((teacherDiscipline) => (
            <Tests
              key={teacherDiscipline.id}
              tests={teacherDiscipline.tests.filter(
                (test) => test.category.id === category.id
              )}
              disciplineName={teacherDiscipline.discipline.name}
            />
          ))}
      </Box>
    </>
  );
}

interface TestsProps {
  disciplineName: string;
  tests: Test[];
}

function Tests({ tests, disciplineName }: TestsProps) {
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
      {tests.map((test) => {
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
              >{`${test.name} (${disciplineName})`}</Link>
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <VisibilityOutlinedIcon /> {`  ${views}`}
            </Box>
          </Box>
        );
      })}
    </>
  );
}

export default Instructors;
