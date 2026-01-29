const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

const CLIENT_ID = "283450392976-bstppal8fiku824aaak00s6s28045148.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'seu-email@gmail.com',
    pass: 'sua-senha-de-app-aqui'
  }
});

function carregarUsuarios() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, '[]');
      return [];
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error("Erro ao carregar usuários:", err);
    return [];
  }
}

function salvarUsuarios(usuarios) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(usuarios, null, 2));
  } catch (err) {
    console.error("Erro ao salvar usuários:", err);
  }
}

app.post('/auth/google', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID
    });

    const payload = ticket.getPayload();
    let usuarios = carregarUsuarios();
    let user = usuarios.find(u => u.email === payload.email);

    if (!user) {
      user = {
        nome: payload.name,
        email: payload.email,
        senha: "",
        nascimento: "",
        foto: payload.picture,
        bio: "Estudante do IFRN",
        instagram: "",
        progresso: 0
      };
      usuarios.push(user);
      salvarUsuarios(usuarios);
    }

    res.json({ success: true, user });
  } catch {
    res.status(401).json({ success: false, message: "Token inválido" });
  }
});

app.post('/auth/register', (req, res) => {
  const { nome, email, senha, nascimento } = req.body;
  let usuarios = carregarUsuarios();

  const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
  if (!specialCharRegex.test(senha)) {
    return res.status(400).json({
      success: false,
      message: "A senha deve conter pelo menos um símbolo especial."
    });
  }

  if (usuarios.find(u => u.email === email)) {
    return res.status(400).json({
      success: false,
      message: "E-mail já cadastrado."
    });
  }

  const novoUsuario = {
    nome,
    email,
    senha,
    nascimento,
    foto: "",
    bio: "Novo no Durmsgeo",
    instagram: "",
    progresso: 0
  };

  usuarios.push(novoUsuario);
  salvarUsuarios(usuarios);

  res.json({ success: true, message: "Cadastro realizado!" });
});

app.post('/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  const usuarios = carregarUsuarios();
  const user = usuarios.find(u => u.email === email);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "E-mail não encontrado."
    });
  }

  const mailOptions = {
    from: '"Durmsgeo IFRN" <seu-email@gmail.com>',
    to: email,
    subject: 'Recuperação de Acesso - Durmsgeo',
    html: `
      <div style="font-family:sans-serif;background:#0f172a;color:white;padding:30px;border-radius:20px;">
        <h1 style="color:#05df34;">Durmsgeo IFRN</h1>
        <p>Olá <strong>${user.nome}</strong>,</p>
        <p>Seus dados de acesso são:</p>
        <div style="background:#1e293b;padding:15px;border-radius:10px;">
          <p><b>Email:</b> ${user.email}</p>
          <p><b>Senha:</b> ${user.senha}</p>
        </div>
        <p style="font-size:12px;color:#94a3b8;">Recomendamos trocar sua senha após o login.</p>
      </div>
    `
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Erro ao enviar e-mail."
      });
    }
    res.json({ success: true, message: "E-mail enviado com sucesso!" });
  });
});

app.post('/auth/login', (req, res) => {
  const { email, senha } = req.body;
  const usuarios = carregarUsuarios();
  const user = usuarios.find(u => u.email === email && u.senha === senha);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "E-mail ou senha inválidos."
    });
  }

  res.json({ success: true, user });
});

app.listen(PORT, () =>
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`)
);
