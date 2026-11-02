// Login do Google pelo domínio da loja (a tela do Google mostra "todabelaoficial.com.br").
// Desligado: o Google recusa com redirect_uri_mismatch enquanto
// https://www.todabelaoficial.com.br/__/auth/handler não estiver nas URIs de redirecionamento
// do client OAuth "Web client" do projeto. Depois de cadastrar, troque para true.
const USE_STORE_AUTH_DOMAIN = false;
const STORE_DOMAIN = 'todabelaoficial.com.br';
const authDomain =
  USE_STORE_AUTH_DOMAIN && typeof window !== 'undefined' && window.location.hostname.endsWith(STORE_DOMAIN)
    ? window.location.host
    : "studio-6696860128-c7a6f.firebaseapp.com";

export const firebaseConfig = {
  projectId: "studio-6696860128-c7a6f",
  appId: "1:230285150149:web:ae474006c312252abf2dac",
  apiKey: "AIzaSyBJki1BY5pTFKVINyQpDXDJvRh9JBn1_t4",
  authDomain,
  messagingSenderId: "230285150149",
  storageBucket: "studio-6696860128-c7a6f.firebasestorage.app"
};
