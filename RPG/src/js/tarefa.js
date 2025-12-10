import React from "react";
import { createRoot } from "react-dom/client";
import TarefaCarrossel from "../components/tarefas/TarefasCarrossel";

// Pega a div com id="root" do tarefa.html
const container = document.getElementById("root");

// Cria a raiz React
const root = createRoot(container);

// Renderiza o componente dentro da div
root.render(React.createElement(TarefaCarrossel));