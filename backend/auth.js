/* ==========================================================================
   AUTENTICAÇÃO & GERENCIAMENTO DE PERFIL (Auth + Firestore + Storage)
   ========================================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Importar Firestore (Banco de Dados para a Bio) e Storage (Para a Foto)
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// --- CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyDt-F7LIMXexdmTxRSengUQJ95ekpBv6ns",
  authDomain: "durmsgeo.firebaseapp.com",
  projectId: "durmsgeo",
  storageBucket: "durmsgeo.firebasestorage.app",
  messagingSenderId: "907855050243",
  appId: "1:907855050243:web:383beea82e93864da68036",
  measurementId: "G-Z9GDQSV77M"
};

// Inicializa Serviços
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();

/* =====================
   LOGIN & REGISTRO
   ===================== */

window.loginGoogle = async function() {
  try {
    await signInWithPopup(auth, provider);
    window.location.href = "index.html";
  } catch (error) {
    console.error("Erro Google:", error);
    alert("Erro ao entrar com Google: " + error.message);
  }
};

window.login = async function() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  if (!email || !senha) return alert("Preencha todos os campos.");

  try {
    await signInWithEmailAndPassword(auth, email, senha);
    window.location.href = "index.html";
  } catch (error) {
    console.error("Erro Login:", error);
    alert("Email ou senha inválidos.");
  }
};

window.register = async function() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;
  if (!email || !senha) return alert("Preencha todos os campos.");

  try {
    await createUserWithEmailAndPassword(auth, email, senha);
    alert("Conta criada! Redirecionando para completar o perfil...");
    window.location.href = "perfil.html"; 
  } catch (error) {
    console.error("Erro Registro:", error);
    alert("Erro ao criar conta: " + error.message);
  }
};

window.logout = function() {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};

/* =====================
   LÓGICA DO PERFIL (Salvar Foto e Bio)
   ===================== */

// Função chamada apenas na página perfil.html para carregar dados
window.carregarDadosPerfil = function() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Preenche dados básicos do Auth
      const nomeInput = document.getElementById("profile-name-input");
      const emailDisplay = document.getElementById("profile-email-display");
      const imgPreview = document.getElementById("profile-pic-preview");
      const bioInput = document.getElementById("profile-bio-input");

      if(nomeInput) nomeInput.value = user.displayName || "";
      if(emailDisplay) emailDisplay.innerText = user.email;
      if(imgPreview) imgPreview.src = user.photoURL || "https://cdn-icons-png.flaticon.com/512/847/847969.png";

      // Busca a "Bio" no Firestore
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && bioInput) {
          bioInput.value = docSnap.data().bio || "";
        }
      } catch (e) {
        console.log("Perfil ainda sem dados extras.");
      }
    } else {
      window.location.href = "login.html"; // Se não estiver logado, manda pro login
    }
  });
};

// Função para SALVAR as alterações
window.salvarPerfil = async function() {
  const user = auth.currentUser;
  if (!user) return;

  const nomeInput = document.getElementById("profile-name-input").value;
  const bioInput = document.getElementById("profile-bio-input").value;
  const fileInput = document.getElementById("profile-pic-input");
  const btnSalvar = document.querySelector(".btn-save");

  btnSalvar.innerText = "Salvando...";
  btnSalvar.disabled = true;

  try {
    let photoURL = user.photoURL;

    // 1. Se tiver arquivo selecionado, faz upload pro Storage
    if (fileInput && fileInput.files[0]) {
      const file = fileInput.files[0];
      // Define o caminho: avatars/ID_DO_USUARIO
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      photoURL = await getDownloadURL(storageRef);
    }

    // 2. Atualiza Nome e Foto no Auth (Perfil básico)
    await updateProfile(user, {
      displayName: nomeInput,
      photoURL: photoURL
    });

    // 3. Salva a Bio e outros dados no Firestore (Banco de dados)
    await setDoc(doc(db, "users", user.uid), {
      bio: bioInput,
      email: user.email,
      lastUpdate: new Date()
    }, { merge: true });

    alert("Perfil atualizado com sucesso!");
    window.location.reload(); 

  } catch (error) {
    console.error("Erro ao salvar perfil:", error);
    alert("Erro ao salvar: " + error.message);
  } finally {
    btnSalvar.innerText = "Salvar Alterações";
    btnSalvar.disabled = false;
  }
};

/* =====================
   OBSERVADOR GLOBAL (Para o Header do Index e outras páginas)
   ===================== */
onAuthStateChanged(auth, (user) => {
  // Elementos do Header (index.html)
  const navLogin = document.getElementById("nav-login-btn");
  const navUser = document.getElementById("nav-user-profile");
  const userAvatar = document.getElementById("nav-user-avatar");

  // Atualiza o Header se os elementos existirem
  if (navLogin && navUser) {
    if (user) {
      navLogin.style.display = "none";
      navUser.style.display = "flex";
      if(userAvatar) {
        userAvatar.src = user.photoURL || "https://cdn-icons-png.flaticon.com/512/847/847969.png";
      }
    } else {
      navLogin.style.display = "inline-flex";
      navUser.style.display = "none";
    }
  }
  
  // Se estivermos na página de perfil, carregar dados específicos
  if (window.location.pathname.includes("perfil.html")) {
    window.carregarDadosPerfil();
  }
});