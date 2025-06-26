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
  const [tccTitle, setTccTitle] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [orientadores, setOrientadores] = useState([]);
  const [selectedOrientador, setSelectedOrientador] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUserData({
        ...userData,
        name: storedUser.nomeCompleto || storedUser.username,
        notifications: storedUser.notifications || 0
      });
    }

    const fetchOrientadores = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/orientadores', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setOrientadores(data.orientadores);
        }
      } catch (error) {
        console.error('Erro ao buscar orientadores:', error);
      }
    };

    fetchOrientadores();
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

    if (!tccTitle.trim()) {
      setUploadStatus('Por favor, informe o título do TCC!');
      return;
    }

    if (!selectedOrientador) {
      setUploadStatus('Por favor, selecione um orientador!');
      return;
    }

    const formData = new FormData();
    formData.append('tccFile', selectedFile);
    formData.append('titulo', tccTitle);
    formData.append('orientadorId', selectedOrientador);

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
        setTccTitle('');
        setSelectedOrientador('');
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
                <div className="form-group">
                  <label htmlFor="tcc-title">Título do TCC</label>
                  <input 
                    type="text" 
                    id="tcc-title"
                    value={tccTitle}
                    onChange={(e) => setTccTitle(e.target.value)}
                    placeholder="Digite o título do trabalho"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="orientador-select">Orientador</label>
                  <select
                    id="orientador-select"
                    value={selectedOrientador}
                    onChange={(e) => setSelectedOrientador(e.target.value)}
                    className="form-control"
                  >
                    <option value="">Selecione um orientador</option>
                    {orientadores.map(orientador => (
                      <option key={orientador._id} value={orientador._id}>
                        {orientador.nomeCompleto}
                      </option>
                    ))}
                  </select>
                </div>
                
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
                  disabled={!selectedFile || !tccTitle || !selectedOrientador}
                >
                  Enviar TCC
                </button>
              </div>
              {uploadStatus && <div className={`upload-status ${uploadStatus.includes('sucesso') ? 'success' : 'error'}`}>
                {uploadStatus}
              </div>}
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
      default:
        return null;
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