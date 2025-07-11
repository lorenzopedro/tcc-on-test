const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Joi = require('joi');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

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
    dataCadastro: { type: Date, default: Date.now },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }
});

const User = mongoose.model('User', userSchema);

const tccSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    alunoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orientadorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    arquivo_url: { type: String, required: true },
    data_envio: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['pendente', 'andamento', 'aprovado', 'agendado', 'aprovada', 'reprovada'],
        default: 'pendente'
    },
    feedback: { type: String, default: '' },
    feedback_text: { type: String, default: '' },
    arquivo_corrigido_url: { type: String, default: '' },
    data_apresentacao: { type: Date },
    local_apresentacao: { type: String },
    banca: [{
        professorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        papel: { type: String }
    }]
}, { timestamps: true });

const TCC = mongoose.model('TCC', tccSchema);

// NOVO: Schema para Notificações
const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    tcc: { type: mongoose.Schema.Types.ObjectId, ref: 'TCC' }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);


const alunoSchema = Joi.object({
    nomeCompleto: Joi.string().required(),
    email: Joi.string().email().required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    matricula: Joi.string().required(),
    curso: Joi.string().required(),
    senha: Joi.string().min(6).required(),
    confirmacaoSenha: Joi.string().valid(Joi.ref('senha')).required()
});

const orientadorSchema = Joi.object({
    nomeCompleto: Joi.string().required(),
    email: Joi.string().email().required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    curso: Joi.string().required(),
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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Configuração do Nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true para 465, false para outras portas
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

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

app.post('/esqueci-senha', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'Se um usuário com este e-mail existir, um link de recuperação será enviado.'
            });
        }

        const token = crypto.randomBytes(20).toString('hex');

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hora

        await user.save();

        const resetURL = `http://localhost:5173/redefinir-senha/${token}`;

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Recuperação de Senha - TCC ON',
            text: `Você está recebendo este e-mail porque você (ou alguém) solicitou a redefinição da senha da sua conta.\n\n` +
                  `Por favor, clique no link a seguir ou cole-o no seu navegador para completar o processo:\n\n` +
                  `${resetURL}\n\n` +
                  `Se você não solicitou isso, por favor, ignore este e-mail e sua senha permanecerá inalterada.\n`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: 'Um e-mail de recuperação foi enviado para ' + user.email + '.'
        });

    } catch (error) {
        console.error('Erro no processo de esqueci a senha:', error);
        res.status(500).json({
            success: false,
            message: 'Erro no servidor. Tente novamente mais tarde.'
        });
    }
});

app.post('/redefinir-senha/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'O token de redefinição de senha é inválido ou expirou.' });
        }

        const { senha, confirmarSenha } = req.body;
        if (senha !== confirmarSenha) {
            return res.status(400).json({ success: false, message: 'As senhas não coincidem.' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ success: true, message: 'Senha redefinida com sucesso!' });

    } catch (error) {
        console.error('Erro ao redefinir a senha:', error);
        res.status(500).json({ success: false, message: 'Erro no servidor.' });
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

app.get('/api/orientadores', authMiddleware, async (req, res) => {
    try {
        const orientadores = await User.find({ tipo: 'orientador' }).select('nomeCompleto _id');
        res.json({ success: true, orientadores });
    } catch (error) {
        console.error('Erro ao buscar orientadores:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar orientadores' });
    }
});

// EDITADO: Rota de Upload de TCC com criação de notificação
app.post('/tcc/upload', authMiddleware, upload.single('tccFile'), async (req, res) => {
    try {
        const { titulo, orientadorId } = req.body;

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado' });
        }

        const novoTCC = new TCC({
            titulo,
            alunoId: req.user._id,
            orientadorId,
            arquivo_url: `/uploads/${req.file.filename}`,
            status: 'pendente'
        });

        await novoTCC.save();
        
        // NOVO: Criar notificação para o orientador
        const notificationMessage = `O Aluno ${req.user.nomeCompleto} enviou um TCC para análise.`;
        const newNotification = new Notification({
            recipient: orientadorId,
            sender: req.user._id,
            message: notificationMessage,
            tcc: novoTCC._id
        });
        await newNotification.save();


        res.json({
            success: true,
            message: 'TCC enviado com sucesso',
            tcc: novoTCC
        });
    } catch (error) {
        console.error('Erro ao enviar TCC:', error);
        res.status(500).json({ success: false, message: 'Erro ao enviar TCC' });
    }
});


app.get('/orientador/tccs', authMiddleware, async (req, res) => {
    try {
        if (req.user.tipo !== 'orientador') {
            return res.status(403).json({ success: false, message: 'Acesso não autorizado' });
        }

        const tccs = await TCC.find({ orientadorId: req.user._id })
            .populate('alunoId', 'nomeCompleto matricula')
            .sort({ data_envio: -1 });

        const tccsFormatados = tccs.map(tcc => ({
            _id: tcc._id,
            titulo: tcc.titulo,
            aluno_nome: tcc.alunoId.nomeCompleto,
            matricula: tcc.alunoId.matricula,
            arquivo_url: tcc.arquivo_url,
            data_envio: tcc.data_envio,
            status: tcc.status,
            feedback: tcc.feedback
        }));

        res.json({ success: true, tccs: tccsFormatados });
    } catch (error) {
        console.error('Erro ao buscar TCCs:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar TCCs' });
    }
});

// EDITADO: Rota de Feedback com criação de notificação
app.post('/tcc/:id/feedback', authMiddleware, upload.single('correctionFile'), async (req, res) => {
    try {
        const { id } = req.params;
        const { feedback } = req.body;

        if (req.user.tipo !== 'orientador') {
            return res.status(403).json({ success: false, message: 'Apenas orientadores podem enviar feedback' });
        }

        const tcc = await TCC.findById(id);
        if (!tcc) {
            return res.status(404).json({ success: false, message: 'TCC não encontrado' });
        }

        if (tcc.orientadorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Você não é o orientador deste TCC' });
        }

        tcc.feedback_text = feedback;

        if (req.file) {
            tcc.arquivo_corrigido_url = `/uploads/${req.file.filename}`;
        }

        tcc.status = 'andamento';

        await tcc.save();
        
        // NOVO: Criar notificação para o aluno
        const notificationMessage = `O Orientador ${req.user.nomeCompleto} enviou um feedback sobre seu TCC!`;
        const newNotification = new Notification({
            recipient: tcc.alunoId,
            sender: req.user._id,
            message: notificationMessage,
            tcc: tcc._id
        });
        await newNotification.save();


        res.json({
            success: true,
            message: 'Feedback enviado com sucesso',
            tcc
        });
    } catch (error) {
        console.error('Erro ao enviar feedback:', error);
        res.status(500).json({ success: false, message: 'Erro ao enviar feedback' });
    }
});

// ... (restante do código original)

// ===============================================
// NOVAS ROTAS PARA NOTIFICAÇÕES
// ===============================================

// Rota para buscar todas as notificações do usuário
app.get('/api/notifications', authMiddleware, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate('sender', 'nomeCompleto tipo')
            .sort({ createdAt: -1 });
        res.json({ success: true, notifications });
    } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar notificações' });
    }
});

// Rota para contar notificações não lidas
app.get('/api/notifications/unread-count', authMiddleware, async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            recipient: req.user._id,
            read: false
        });
        res.json({ success: true, count });
    } catch (error) {
        console.error('Erro ao contar notificações não lidas:', error);
        res.status(500).json({ success: false, message: 'Erro ao contar notificações' });
    }
});

// EDITADO: Rota para marcar uma notificação específica como lida
app.put('/api/notifications/:id/read', authMiddleware, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notificação não encontrada.' });
        }

        res.json({ success: true, message: 'Notificação marcada como lida.' });
    } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        res.status(500).json({ success: false, message: 'Erro ao marcar notificação.' });
    }
});

// ===============================================

app.put('/tcc/:id/aprovar', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.tipo !== 'orientador') {
            return res.status(403).json({ success: false, message: 'Apenas orientadores podem aprovar TCCs' });
        }

        const tcc = await TCC.findById(id);
        if (!tcc) {
            return res.status(404).json({ success: false, message: 'TCC não encontrado' });
        }

        if (tcc.orientadorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Você não é o orientador deste TCC' });
        }

        tcc.status = 'aprovado';
        await tcc.save();

        res.json({
            success: true,
            message: 'TCC aprovado com sucesso e encaminhado para o supervisor',
            tcc
        });
    } catch (error) {
        console.error('Erro ao aprovar TCC:', error);
        res.status(500).json({ success: false, message: 'Erro ao aprovar TCC' });
    }
});

app.put('/tcc/:id/agendar', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { data_apresentacao, local_apresentacao, banca } = req.body;

        if (req.user.tipo !== 'supervisor') {
            return res.status(403).json({ success: false, message: 'Apenas supervisores podem agendar apresentações' });
        }

        const tcc = await TCC.findById(id);
        if (!tcc) {
            return res.status(404).json({ success: false, message: 'TCC não encontrado' });
        }

        tcc.data_apresentacao = new Date(data_apresentacao);
        tcc.local_apresentacao = local_apresentacao;
        tcc.banca = banca;
        tcc.status = 'agendado';

        await tcc.save();

        res.json({
            success: true,
            message: 'Apresentação agendada com sucesso',
            tcc
        });
    } catch (error) {
        console.error('Erro ao agendar apresentação:', error);
        res.status(500).json({ success: false, message: 'Erro ao agendar apresentação' });
    }
});

app.get('/api/professores', authMiddleware, async (req, res) => {
    try {
        const professores = await User.find({
            tipo: { $in: ['orientador', 'coordenador'] }
        }).select('nomeCompleto _id');

        res.json({ success: true, professores });
    } catch (error) {
        console.error('Erro ao buscar professores:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar professores' });
    }
});

app.get('/aluno/feedback', authMiddleware, async (req, res) => {
    try {
        if (req.user.tipo !== 'aluno') {
            return res.status(403).json({ success: false, message: 'Acesso não autorizado' });
        }

        const tcc = await TCC.findOne({ alunoId: req.user._id })
            .populate('orientadorId', 'nomeCompleto')
            .sort({ data_envio: -1 });

        if (!tcc) {
            return res.json({ success: true, feedback: null });
        }

        res.json({
            success: true,
            feedback: {
                text: tcc.feedback_text,
                correctedFile: tcc.arquivo_corrigido_url,
                lastUpdate: tcc.updatedAt || tcc.data_envio
            }
        });
    } catch (error) {
        console.error('Erro ao buscar feedback:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar feedback' });
    }
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

app.get('/supervisor/tccs-aprovados', authMiddleware, async (req, res) => {
    try {
        if (req.user.tipo !== 'supervisor') {
            return res.status(403).json({ success: false, message: 'Acesso não autorizado' });
        }

        const tccs = await TCC.find({ status: 'aprovado' })
            .populate('alunoId', 'nomeCompleto matricula')
            .populate('orientadorId', 'nomeCompleto')
            .sort({ data_envio: -1 });

        res.json({ success: true, tccs });
    } catch (error) {
        console.error('Erro ao buscar TCCs aprovados:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar TCCs aprovados' });
    }
});

app.get('/coordenador/bancas-agendadas', authMiddleware, async (req, res) => {
    try {
        if (req.user.tipo !== 'coordenador') {
            return res.status(403).json({ success: false, message: 'Acesso não autorizado' });
        }

        const bancas = await TCC.find({ status: 'agendado' })
            .populate('alunoId', 'nomeCompleto matricula')
            .populate('orientadorId', 'nomeCompleto')
            .populate('banca.professorId', 'nomeCompleto')
            .sort({ data_apresentacao: 1 });

        res.json({ success: true, bancas });
    } catch (error) {
        console.error('Erro ao buscar bancas agendadas:', error);
        res.status(500).json({ success: false, message: 'Erro ao buscar bancas agendadas' });
    }
});

app.put('/banca/:id/aprovar', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.tipo !== 'coordenador') {
            return res.status(403).json({ success: false, message: 'Apenas coordenadores podem aprovar bancas' });
        }

        const tcc = await TCC.findByIdAndUpdate(id, { status: 'aprovada' }, { new: true });

        if (!tcc) {
            return res.status(404).json({ success: false, message: 'Banca não encontrada' });
        }

        res.json({
            success: true,
            message: 'Banca aprovada com sucesso',
            tcc
        });
    } catch (error) {
        console.error('Erro ao aprovar banca:', error);
        res.status(500).json({ success: false, message: 'Erro ao aprovar banca' });
    }
});

app.put('/banca/:id/reprovar', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.tipo !== 'coordenador') {
            return res.status(403).json({ success: false, message: 'Apenas coordenadores podem reprovar bancas' });
        }

        const tcc = await TCC.findByIdAndUpdate(id, { status: 'reprovada' }, { new: true });

        if (!tcc) {
            return res.status(404).json({ success: false, message: 'Banca não encontrada' });
        }

        res.json({
            success: true,
            message: 'Banca reprovada com sucesso',
            tcc
        });
    } catch (error) {
        console.error('Erro ao reprovar banca:', error);
        res.status(500).json({ success: false, message: 'Erro ao reprovar banca' });
    }
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