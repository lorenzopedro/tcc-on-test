import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './login';
import SelecionarTipo from './selecionarTipo';
import CadastroAluno from "./components/cadastro/cadastroAluno";
import CadastroOrientador from "./components/cadastro/cadastroOrientador";
import CadastroCoordenador from "./components/cadastro/cadastroCoordenador";
import CadastroSupervisor from "./components/cadastro/cadastroSupervisor";
import EsqueciSenha from "./components/cadastro/EsqueciSenha"; 
import RedefinirSenha from "./components/cadastro/RedefinirSenha";  
import DashboardAluno from "./components/dashboard/DashboardAluno";
import DashboardOrientador from "./components/dashboard/DashboardOrientador";
import DashboardCoordenador from './components/dashboard/DashboardCoordenador';
import DashboardSupervisor from './components/dashboard/DashboardSupervisor';
import Mensagens from './components/mensagens/Mensagens';


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
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route path="/redefinir-senha/:token" element={<RedefinirSenha />} />
        <Route path="/dashboard-aluno" element={<DashboardAluno />} />
        <Route path="/dashboard-orientador" element={<DashboardOrientador />} />
        <Route path="/dashboard-coordenador" element={<DashboardCoordenador />} />
        <Route path="/dashboard-supervisor" element={<DashboardSupervisor />} />
        <Route path="/mensagens" element={<Mensagens />} />       
      </Routes>
    </Router>
  );
}

export default App;