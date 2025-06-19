import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './login';
import SelecionarTipo from './selecionarTipo';
import CadastroAluno from "./components/cadastro/cadastroAluno";
import CadastroOrientador from "./components/cadastro/cadastroOrientador";
import CadastroCoordenador from "./components/cadastro/cadastroCoordenador";
import CadastroSupervisor from "./components/cadastro/cadastroSupervisor";
import DashboardAluno from "./components/dashboard/DashboardAluno";
import DashboardOrientador from "./components/dashboard/DashboardOrientador";
import DashboardCoordenador from './components/dashboard/DashboardCoordenador';
import DashboardSupervisor from './components/dashboard/DashboardSupervisor';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/selecionar-tipo" element={<SelecionarTipo />} />
        <Route path="/cadastro/aluno" element={<CadastroAluno />} />
        <Route path="/cadastro/orientador" element={<CadastroOrientador />} />
        <Route path="/cadastro/coordenador" element={<CadastroCoordenador />} />
        <Route path="/cadastro/supervisor" element={<CadastroSupervisor />} />
        <Route path="/dashboard-aluno" element={<DashboardAluno />} />
        <Route path="/dashboard-orientador" element={<DashboardOrientador />} />
        <Route path="/dashboard-coordenador" element={<DashboardCoordenador />} />
        <Route path="/dashboard-supervisor" element={<DashboardSupervisor />} />       
      </Routes>
    </Router>
  );
}

export default App;