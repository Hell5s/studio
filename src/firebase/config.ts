// No site oficial o login do Google passa pelo próprio domínio da loja (o next.config.ts
// repassa /__/auth para o Firebase), então a tela do Google mostra "todabelaoficial.com.br"
// em vez de "studio-6696860128-c7a6f.firebaseapp.com". Fora dele (localhost) usa o padrão.
const STORE_DOMAIN = 'todabelaoficial.com.br';
const authDomain =
  typeof window !== 'undefined' && window.location.hostname.endsWith(STORE_DOMAIN)
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