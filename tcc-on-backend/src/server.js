const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Joi = require('joi');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/tcc-system')
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro na conexão com MongoDB:', err));

const userSchema = new mongoose.Schema({
  nomeCompleto: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  tipo: { type: String, required: true, enum: ['aluno', 'orientador', 'coordenador', 'supervisor', 'admin'] },

  matricula: { type: String },
  curso: { type: String },

  areaAtuacao: { type: String },

  departamento: { type: String },
  cargo: { type: String },

  cpf: { type: String },
  empresa: { type: String },
  cargoEmpresa: { type: String },
  telefone: { type: String },

  dataCadastro: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const alunoSchema = Joi.object({
  nomeCompleto: Joi.string().required(),
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  matricula: Joi.string().required(),
  curso: Joi.string().required(),
  senha: Joi.string().min(6).required(),
  confirmacaoSenha: Joi.string().valid(Joi.ref('senha')).required()
});

// ❌ REMOVIDO DO orientadorSchema: campo `curso`
const orientadorSchema = Joi.object({
  nomeCompleto: Joi.string().required(),
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  senha: Joi.string().min(6).required(),
  confirmacaoSenha: Joi.string().valid(Joi.ref('senha')).required()
});

const coordenadorSchema = Joi.object({
  nomeCompleto: Joi.string().required(),
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  departamento: Joi.string().required(),
  cargo: Joi.string().required(),
  senha: Joi.string().min(6).required(),
  confirmacaoSenha: Joi.string().valid(Joi.ref('senha')).required()
});

const supervisorSchema = Joi.object({
  nomeCompleto: Joi.string().required(),
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  cpf: Joi.string().required(),
  empresa: Joi.string().required(),
  cargoEmpresa: Joi.string().required(),
  telefone: Joi.string().required(),
  senha: Joi.string().min(6).required(),
  confirmacaoSenha: Joi.string().valid(Joi.ref('senha')).required()
});

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error('Token não fornecido');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreta');
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Não autorizado: ' + error.message 
    });
  }
};

app.get('/', (req, res) => {
  res.send('API TCC Online está rodando 🚀');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Senha incorreta' 
      });
    }

    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username,
        tipo: user.tipo 
      }, 
      process.env.JWT_SECRET || 'secreta', 
      { expiresIn: '1h' }
    );

    res.json({ 
      success: true, 
      message: 'Login bem-sucedido', 
      token,
      user: {
        id: user._id,
        username: user.username,
        tipo: user.tipo,
        nomeCompleto: user.nomeCompleto
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro no servidor' 
    });
  }
});

const handleCadastro = async (req, res, tipo, schema) => {
  try {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message 
      });
    }

    const { senha, confirmacaoSenha, ...rest } = req.body;

    const existingUser = await User.findOne({ 
      $or: [
        { email: req.body.email },
        { username: req.body.username }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'E-mail ou nome de usuário já cadastrado' 
      });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const newUser = new User({
      ...rest,
      password: hashedPassword,
      tipo
    });

    await newUser.save();

    const token = jwt.sign(
      { 
        id: newUser._id, 
        username: newUser.username,
        tipo: newUser.tipo 
      }, 
      process.env.JWT_SECRET || 'secreta', 
      { expiresIn: '1h' }
    );

    res.status(201).json({ 
      success: true, 
      message: `${tipo} cadastrado com sucesso!`,
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        tipo: newUser.tipo,
        nomeCompleto: newUser.nomeCompleto
      }
    });
  } catch (error) {
    console.error(`Erro no cadastro de ${tipo}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro no servidor' 
    });
  }
};

app.post('/cadastro/aluno', async (req, res) => {
  await handleCadastro(req, res, 'aluno', alunoSchema);
});

app.post('/cadastro/orientador', async (req, res) => {
  await handleCadastro(req, res, 'orientador', orientadorSchema);
});

app.post('/cadastro/coordenador', async (req, res) => {
  await handleCadastro(req, res, 'coordenador', coordenadorSchema);
});

app.post('/cadastro/supervisor', async (req, res) => {
  await handleCadastro(req, res, 'supervisor', supervisorSchema);
});

app.get('/aluno/dashboard', authMiddleware, (req, res) => {
  if (req.user.tipo !== 'aluno') {
    return res.status(403).json({ 
      success: false, 
      message: 'Acesso não autorizado' 
    });
  }
  res.json({ 
    success: true, 
    message: 'Dashboard do Aluno',
    user: req.user
  });
});

app.get('/orientador/dashboard', authMiddleware, (req, res) => {
  if (req.user.tipo !== 'orientador') {
    return res.status(403).json({ 
      success: false, 
      message: 'Acesso não autorizado' 
    });
  }
  res.json({ 
    success: true, 
    message: 'Dashboard do Orientador',
    user: req.user
  });
});

app.get('/coordenador/dashboard', authMiddleware, (req, res) => {
  if (req.user.tipo !== 'coordenador') {
    return res.status(403).json({ 
      success: false, 
      message: 'Acesso não autorizado' 
    });
  }
  res.json({ 
    success: true, 
    message: 'Dashboard do Coordenador',
    user: req.user
  });
});

app.get('/supervisor/dashboard', authMiddleware, (req, res) => {
  if (req.user.tipo !== 'supervisor') {
    return res.status(403).json({ 
      success: false, 
      message: 'Acesso não autorizado' 
    });
  }
  res.json({ 
    success: true, 
    message: 'Dashboard do Supervisor',
    user: req.user
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Erro interno no servidor' 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
