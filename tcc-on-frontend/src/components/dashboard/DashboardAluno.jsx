import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardAluno.css';

function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "Carregando...",
    role: "Aluno",
    tccStatus: "Em andamento",
    notifications: 0
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUserData({
        ...userData,
        name: storedUser.nomeCompleto || storedUser.username,
        notifications: storedUser.notifications || 0
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setUploadStatus('');
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Por favor, selecione um arquivo!');
      return;
    }

    if (selectedFile.type !== 'application/pdf') {
      setUploadStatus('Apenas arquivos PDF são permitidos!');
      return;
    }

    const formData = new FormData();
    formData.append('tccFile', selectedFile);
    formData.append('alunoId', JSON.parse(localStorage.getItem('user'))._id);

    try {
      setUploadStatus('Enviando arquivo...');
      
      const response = await fetch('http://localhost:5000/tcc/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setUploadStatus('TCC enviado com sucesso!');
        setUserData({
          ...userData,
          tccStatus: "Aguardando revisão"
        });
        setSelectedFile(null);
      } else {
        const errorData = await response.json();
        setUploadStatus(`Erro: ${errorData.message}`);
      }
    } catch (error) {
      setUploadStatus('Erro ao conectar com o servidor');
    }
  };

  const renderContentByRole = () => {
    switch (userData.role) {
      case "Aluno":
        return (
          <div className="student-dashboard">
            <h2>Meu TCC</h2>
            <div className="status-container">
              <p><strong>Status:</strong> {userData.tccStatus}</p>
              <p><strong>Última atualização:</strong> {new Date().toLocaleDateString()}</p>
            </div>
            
            <div className="file-upload-section">
              <h3>Enviar TCC</h3>
              <div className="upload-area">
                <input 
                  type="file" 
                  id="tcc-upload" 
                  accept=".pdf" 
                  onChange={handleFileChange}
                />
                <label htmlFor="tcc-upload" className="file-input-label">
                  {selectedFile ? selectedFile.name : "Selecionar arquivo PDF"}
                </label>
                <button 
                  onClick={handleFileUpload} 
                  className="dashboard-button primary"
                  disabled={!selectedFile}
                >
                  Enviar TCC
                </button>
              </div>
              {uploadStatus && <div className="upload-status">{uploadStatus}</div>}
            </div>

            <div className="tcc-info">
              <h3>Orientações Recentes</h3>
              <p><strong>Seu orientador solicitou as seguintes alterações:</strong></p>
              <ul>
                <li>Revisar capítulo 3</li>
                <li>Incluir mais referências bibliográficas</li>
              </ul>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo-container">
          <h1>TCC ON</h1>
          <p>Sistema de Gerenciamento de TCC</p>
        </div>
        <div className="user-info">
          <div className="user-details">
            <span className="user-name">Bem-vindo, {userData.name}</span>
            <span className="user-role">{userData.role}</span>
          </div>
          <div className="notification-badge">
            <span>{userData.notifications}</span>
          </div>
          <button onClick={handleLogout} className="logout-button">Sair</button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <ul>
          <li><a href="/dashboard" className="active">Início</a></li>
          <li><a href="/tccs">TCCs</a></li>
          <li>
            <a href="/mensagens">
              Mensagens
              {userData.notifications > 0 && (
                <span className="nav-notification">{userData.notifications}</span>
              )}
            </a>
          </li>
          {userData.role === "Coordenador" && (
            <li><a href="/admin">Administração</a></li>
          )}
        </ul>
      </nav>

      <main className="dashboard-main">
        {renderContentByRole()}
      </main>

      <footer className="dashboard-footer">
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

export default Dashboard;