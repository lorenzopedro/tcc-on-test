import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardCoordenador.css';

function DashboardCoordenador() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "Carregando...",
    role: "Coordenador do TCC",
    departamento: "Sistemas de Informação",
    notifications: 0
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUserData({
        name: storedUser.nomeCompleto || storedUser.username,
        role: "Coordenador do TCC",
        departamento: storedUser.departamento || "Sistemas de Informação",
        notifications: storedUser.notifications || 0
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const tccsParaAprovar = [
    {
      id: 1,
      aluno: "João Silva",
      orientador: "Prof. Eder Santana",
      titulo: "Sistema de Gestão Acadêmica",
      status: "Aguardando aprovação",
      dataSubmissao: "10/05/2025"
    },
    {
      id: 2,
      aluno: "Maria Santos",
      orientador: "Prof. Rafael Marinho",
      titulo: "Aplicativo para Controle Financeiro",
      status: "Aguardando aprovação",
      dataSubmissao: "11/05/2025"
    },
    {
      id: 3,
      aluno: "Enzo Fernandes",
      orientador: "Prof. Juliana Lilis",
      titulo: "IA para Diagnóstico Médico",
      status: "Aguardando aprovação",
      dataSubmissao: "12/05/2025"
    },
    {
      id: 4,
      aluno: "Ana Costa",
      orientador: "Prof. Henaldo Barros",
      titulo: "Blockchain para Votação Digital",
      status: "Aguardando aprovação",
      dataSubmissao: "13/05/2025"
    }
  ];

  const orientadores = [
    {
      id: 1,
      nome: "Prof. Eder Santana",
      qtdOrientandos: 5,
      departamento: "Computação",
      capacidade: 8
    },
    {
      id: 2,
      nome: "Prof. Juliana Lilis",
      qtdOrientandos: 3,
      departamento: "Engenharia de Software",
      capacidade: 5
    },
    {
      id: 3,
      nome: "Prof. Rafael Marinho",
      qtdOrientandos: 2,
      departamento: "Desenvolvimento Web",
      capacidade: 4
    },
    {
      id: 4,
      nome: "Prof. Henaldo Barros",
      qtdOrientandos: 4,
      departamento: "Redes",
      capacidade: 6
    }
  ];

  const handleAprovarTCC = (id) => {
    alert(`TCC ${id} aprovado com sucesso!`);
  };

  const handleReprovarTCC = (id) => {
    alert(`TCC ${id} reprovado!`);
  };

  return (
    <div className="coordenador-container">
      <header className="coordenador-header">
        <div className="logo-container">
          <h1>TCC ON</h1>
          <p>Painel do Coordenador</p>
        </div>
        <div className="user-info">
          <div className="user-details">
            <span className="user-name">Bem-vindo, {userData.name}</span>
            <span className="user-role">{userData.role} - {userData.departamento}</span>
          </div>
          <div className="notification-badge">
            <span>{userData.notifications}</span>
          </div>
          <button onClick={handleLogout} className="logout-button">Sair</button>
        </div>
      </header>

      <nav className="coordenador-nav">
        <ul>
          <li><a href="/coordenador" className="active">Início</a></li>
          <li><a href="/coordenador/orientadores">Orientadores</a></li>
          <li><a href="/coordenador/alunos">Alunos</a></li>
          <li>
            <a href="/coordenador/mensagens">
              Mensagens
              {userData.notifications > 0 && (
                <span className="nav-notification">{userData.notifications}</span>
              )}
            </a>
          </li>
        </ul>
      </nav>

      <main className="coordenador-main">
        <div className="coordenador-dashboard">
          <section className="dashboard-section">
            <h2>TCCs para Aprovação de Banca</h2>
            
            <div className="stats-container">
              <div className="stat-card">
                <h3>Aguardando</h3>
                <p className="stat-number">5</p>
              </div>
              <div className="stat-card">
                <h3>Aprovados</h3>
                <p className="stat-number">12</p>
              </div>
              <div className="stat-card">
                <h3>Reprovados</h3>
                <p className="stat-number">3</p>
              </div>
            </div>

            <div className="tcc-list-container">
              <div className="tcc-list">
                {tccsParaAprovar.map(tcc => (
                  <div key={tcc.id} className="tcc-item">
                    <div className="tcc-info">
                      <h3>{tcc.titulo}</h3>
                      <p><strong>Aluno:</strong> {tcc.aluno}</p>
                      <p><strong>Orientador:</strong> {tcc.orientador}</p>
                      <p><strong>Status:</strong> {tcc.status}</p>
                      <p><strong>Submissão:</strong> {tcc.dataSubmissao}</p>
                    </div>
                    <div className="tcc-actions">
                      <button className="dashboard-button primary">Visualizar</button>
                      <button 
                        className="dashboard-button success"
                        onClick={() => handleAprovarTCC(tcc.id)}
                      >
                        Aprovar Banca
                      </button>
                      <button 
                        className="dashboard-button danger"
                        onClick={() => handleReprovarTCC(tcc.id)}
                      >
                        Reprovar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="dashboard-section">
            <h2>Designação de Orientadores</h2>
            
            <div className="stats-container">
              <div className="stat-card">
                <h3>Total</h3>
                <p className="stat-number">15</p>
              </div>
              <div className="stat-card">
                <h3>Ativos</h3>
                <p className="stat-number">12</p>
              </div>
              <div className="stat-card">
                <h3>Vagas</h3>
                <p className="stat-number">23</p>
              </div>
            </div>

            <div className="orientadores-list-container">
              <div className="orientadores-list">
                {orientadores.map(orientador => (
                  <div key={orientador.id} className="orientador-item">
                    <div className="orientador-info">
                      <h3>{orientador.nome}</h3>
                      <p><strong>Departamento:</strong> {orientador.departamento}</p>
                      <p><strong>Orientandos:</strong> {orientador.qtdOrientandos}/{orientador.capacidade}</p>
                      <progress 
                        value={orientador.qtdOrientandos} 
                        max={orientador.capacidade}
                        className="orientador-progress"
                      ></progress>
                    </div>
                    <div className="orientador-actions">
                      <button className="dashboard-button secondary">Designar Aluno</button>
                      <button className="dashboard-button primary">Editar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="coordenador-footer">
        <p>Sistema de TCC - Unipam © {new Date().getFullYear()}</p>
        <div className="footer-links">
          <a href="/sobre">Sobre o Sistema</a>
          <a href="/ajuda">Ajuda</a>
          <a href="/contato">Contato</a>
        </div>
      </footer>
    </div>
  );
}

export default DashboardCoordenador;