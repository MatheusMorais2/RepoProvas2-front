import React, { useState, useEffect, ReactEventHandler } from "react";
import useAuth from "../../hooks/useAuth";
import api, {
  Category,
  Discipline,
  TeacherDisciplines,
  Test,
  TestByDiscipline,
} from "../../services/api";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  TextField,
  SelectChangeEvent,
  Button,
  Box,
} from "@mui/material";
import { Label } from "@mui/icons-material";
import { AxiosError } from "axios";
import useAlert from "../../hooks/useAlert";
import { showMessage } from "../../services/showMessage";

export default function CreateTestForm() {
  const { token } = useAuth();
  const { setMessage } = useAlert();
  const [formValues, setFormValues] = useState({
    name: "",
    pdfUrl: "",
    category: "Categoria",
    discipline: "Disciplina",
    teacher: "Pessoa instrutora",
  });

  interface FormOptions {
    categories: any[];
    disciplines: any[];
    teachers: any[];
  }

  const [formOptions, setFormOptions] = useState<FormOptions>({
    categories: [],
    disciplines: [],
    teachers: [],
  });

  async function loadCategories() {
    if (!token) return;
    const categories = await api.getCategories(token);

    setFormOptions({
      ...formOptions,
      categories: categories.data.categories,
    });
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    switch (e.target.name) {
      case "name":
        setFormValues({ ...formValues, name: e.target.value });
        break;
      case "pdfUrl":
        setFormValues({ ...formValues, pdfUrl: e.target.value });
        break;
    }
  }

  async function loadDisciplines() {
    if (!token) return;
    const disciplines = await api.getDisciplines(token);

    setFormOptions({
      ...formOptions,
      disciplines: disciplines.data,
    });
  }

  function loadTeachers() {
    const discipline = formOptions.disciplines.find(
      (elem) => elem.name === formValues.discipline
    );
    const teachersArray = discipline.teacherDisciplines.map(
      (elem: any) => elem.teacher.name
    );
    setFormOptions({ ...formOptions, teachers: teachersArray });
  }

  function handleSelectChange(e: SelectChangeEvent) {
    e.preventDefault();
    switch (e.target.name) {
      case "category":
        setFormValues({ ...formValues, category: e.target.value });
        loadDisciplines();
        break;
      case "discipline":
        setFormValues({ ...formValues, discipline: e.target.value });
        break;
      case "teacher":
        setFormValues({ ...formValues, teacher: e.target.value });
        break;
    }
  }

  function resetForm() {
    setFormValues({
      name: "",
      pdfUrl: "",
      category: "Categoria",
      discipline: "Disciplina",
      teacher: "Pessoa instrutora",
    });
    setFormOptions({
      categories: [],
      disciplines: [],
      teachers: [],
    });

    loadCategories();
  }

  async function handleSubmit(e: React.MouseEvent) {
    e.preventDefault();
    if (!token) return;
    if (
      !formValues.category ||
      !formValues.teacher ||
      !formValues.discipline ||
      !formValues.name ||
      !formValues.pdfUrl
    ) {
      setMessage({
        type: "error",
        text: "Por favor complete todos os dados",
      });
      return;
    }
    try {
      await api.createTest(token, formValues);

      setMessage({
        type: "success",
        text: `Prova criada com sucesso`,
      });

      resetForm();
    } catch (error: Error | AxiosError | any) {
      setMessage({
        type: "error",
        text: `Link com estrutura incorreta`,
      });
      resetForm();
      return;
    }
  }

  return (
    <>
      <FormControl sx={{ m: 1, width: "700px", gap: "10px" }}>
        <TextField
          id="outlined-basic"
          label="Nome da prova"
          variant="outlined"
          value={formValues.name}
          onChange={handleChange}
          name="name"
        />
        <TextField
          id="outlined-basic"
          label="Link da prova"
          variant="outlined"
          value={formValues.pdfUrl}
          onChange={handleChange}
          name="pdfUrl"
        />
        <Select
          id="select-category"
          value={formValues.category}
          onChange={handleSelectChange}
          name="category"
        >
          <MenuItem disabled value="Categoria">
            <em>Categoria</em>
          </MenuItem>
          {formOptions.categories.map((elem) => {
            return (
              <MenuItem key={elem.id} value={elem.name}>
                {elem.name}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      <FormControl sx={{ m: 1, width: "700px", gap: "10px" }}>
        <Select
          id="select-discipline"
          value={formValues.discipline}
          onChange={handleSelectChange}
          name="discipline"
        >
          <MenuItem disabled value="Disciplina">
            <em>Disciplina</em>
          </MenuItem>
          {formOptions.disciplines.map((elem) => {
            return (
              <MenuItem key={elem.id} value={elem.name}>
                {elem.name}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      <FormControl sx={{ m: 1, width: "700px", gap: "10px" }}>
        <Select
          onOpen={loadTeachers}
          id="select-teacher"
          value={formValues.teacher}
          onChange={handleSelectChange}
          name="teacher"
        >
          <MenuItem disabled value="Pessoa instrutora">
            <em>Pessoa instrutora</em>
          </MenuItem>
          {formOptions.teachers.map((elem) => {
            return (
              <MenuItem key={elem} value={elem}>
                {elem}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      <Box
        sx={{
          m: 1,
          width: "700px",
          gap: "10px",
          display: "flex",
          flexDirection: "row-reverse",
        }}
      >
        <Button variant="contained" onClick={handleSubmit}>
          Enviar
        </Button>
      </Box>
    </>
  );
}
