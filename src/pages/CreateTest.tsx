import { useEffect, useState } from "react";
import api, {
  Category,
  Discipline,
  TeacherDisciplines,
  Test,
  TestByDiscipline,
} from "../services/api";
import useAuth from "../hooks/useAuth";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
import { useNavigate } from "react-router-dom";
import SendIcon from "@mui/icons-material/Send";
import { AxiosError } from "axios";
import useAlert from "../hooks/useAlert";
import { showMessage } from "../services/showMessage";
import CreateTestForm from "../components/CreateTestForm";

export default function CreateTest() {
  const { token } = useAuth();
  const navigate = useNavigate();

  return (
    <>
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
            variant="outlined"
            onClick={() => navigate("/app/pessoas-instrutoras")}
          >
            Pessoa Instrutora
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate("/app/adicionar")}
          >
            Adicionar
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          marginX: "auto",
          paddingTop: "30px",
          width: "700px",
        }}
      >
        <CreateTestForm />
      </Box>
    </>
  );
}
