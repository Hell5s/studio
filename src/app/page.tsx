
"use client";

import { useEffect, useMemo, useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import {
  addDoc,
  collection,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firebaseConfig } from "@/firebase/config";

// Inicialização segura do Firebase
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const brand = {
  name: "Toda Bela",
  colors: {
    wine: "#6E3C47",
    gold: "#C7A17A",
    blush: "#F7E8EA",
    cream: "#FFF9F7",
    rose: "#E9C9CF",
    text: "#2A1F22",
    soft: "#F4ECEE",
  },
};

const hero = {
  title: "Moda Fitness",
  subtitle: "Peças que acompanham seu ritmo com conforto, presença e estilo.",
  cta: "Conferir",
  image:
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80",
};

const collections = [
  {
    title: "Tops",
    image:
      "https://images.unsplash.com/photo-1506629905607-d9c297d7d122?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Leggings",
    image:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Shorts",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Macacões",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
  },
];

const launchProducts = [
  {
    id: "1",
    name: "Top Alongado com Decote Alto",
    price: 99.9,
    oldPrice: 129.9,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "2",
    name: "Macaquinho Contrastante",
    price: 159.9,
    oldPrice: 199.9,
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "3",
    name: "Calça Legging com Cós em V",
    price: 169.9,
    oldPrice: 209.9,
    image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "4",
    name: "Short com Recorte Premium",
    price: 109.9,
    oldPrice: 149.9,
    image: "https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=900&q=80",
  },
];

const basicProducts = [
  {
    id: "5",
    name: "Top Básico com Alças Reguláveis",
    price: 69.9,
    oldPrice: 89.9,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "6",
    name: "Calça Legging Básica",
    price: 99.9,
    oldPrice: 129.9,
    image: "https://images.unsplash.com/photo-1506629905607-d9c297d7d122?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "7",
    name: "Conjunto Básico Lilás",
    price: 69.9,
    oldPrice: 99.9,
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "8",
    name: "Short Básico Azul",
    price: 69.9,
    oldPrice: 89.9,
    image: "https://images.unsplash.com/photo-1464863979621-258859e62245?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "9",
    name: "Top Básico com Bojo",
    price: 69.9,
    oldPrice: 89.9,
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
  },
];

function formatPrice(value: any) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value || 0));
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E9D7DB] bg-white shadow-sm">
        <svg viewBox="0 0 120 120" className="h-7 w-7" fill="none">
          <circle cx="60" cy="60" r="42" stroke={brand.colors.gold} strokeWidth="4" />
          <path
            d="M44 39C44 35.6863 46.6863 33 50 33H70C73.3137 33 76 35.6863 76 39V41C76 44.3137 73.3137 47 70 47H64V83H56V47H50C46.6863 47 44 44.3137 44 41V39Z"
            fill={brand.colors.wine}
          />
        </svg>
      </div>
      <div className="leading-none text-left">
        <p className="text-3xl font-semibold tracking-[-0.05em] text-[#6E3C47]">Toda Bela</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.35em] text-[#C7A17A]">Moda Feminina</p>
      </div>
    </div>
  );
}

function ProductCard({ product, onAdd }: any) {
  return (
    <article className="group">
      <div className="relative overflow-hidden bg-[#F3EFF0]">
        <img
          src={product.image}
          alt={product.name}
          className="h-[420px] w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <button className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-xl text-[#6E3C47] shadow-sm">
          ♡
        </button>
      </div>
      <div className="px-1 pb-2 pt-5 text-center">
        <h3 className="line-clamp-2 text-[15px] uppercase leading-6 text-[#3A3133]">{product.name}</h3>
        <p className="mt-3 text-[2rem] font-light text-[#2A1F22]">{formatPrice(product.price)}</p>
        <p className="text-base text-[#6D575D]">ou 10x de {formatPrice(product.price / 10)}</p>
        <button
          onClick={() => onAdd(product)}
          className="mt-4 rounded-full border border-[#E7C5CC] px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#6E3C47] transition hover:bg-[#F7E8EA]"
        >
          Adicionar
        </button>
      </div>
    </article>
  );
}

function SectionTitle({ title, action }: any) {
  return (
    <div className="mb-8 flex items-center justify-between gap-4">
      <h2 className="text-4xl font-semibold tracking-[-0.04em] text-[#2A1F22]">{title}</h2>
      {action ? <button className="text-lg underline underline-offset-4">{action}</button> : null}
    </div>
  );
}

export default function TodaBelaStorefront() {
  const [cart, setCart] = useState<any[]>([]);
  const [storeProducts, setStoreProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);
  const [isAdmin] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  
  const [productForm, setProductForm] = useState({
    name: "",
    collection: "Moda Fitness",
    category: "Tops",
    price: "",
    oldPrice: "",
    stock: "",
    sizes: "P, M, G, GG",
    color: "",
    badge: "Novo",
    shortDescription: "",
    description: "",
    image: "",
    gallery: "",
    shopeeLink: "",
    featured: false,
    published: true,
    bestseller: false,
  });

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  // PASSO 1 - Sincronização Real
  useEffect(() => {
    if (!db) {
      setProductsLoading(false);
      return;
    }

    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setStoreProducts(items);
      setProductsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // PASSO 4 — GARANTIR FALLBACK
  const storefrontProducts = useMemo(() => {
    if (storeProducts.length) return storeProducts;
    return [...launchProducts, ...basicProducts];
  }, [storeProducts]);

  const launchProductsDisplay = useMemo(() => {
    const featured = storefrontProducts.filter((item) => item.featured || item.bestseller);
    return featured.length ? featured.slice(0, 4) : storefrontProducts.slice(0, 4);
  }, [storefrontProducts]);

  const basicProductsDisplay = useMemo(() => {
    return storefrontProducts.slice(4, 9).length ? storefrontProducts.slice(4, 9) : basicProducts;
  }, [storefrontProducts]);

  function handleFormChange(field: string, value: any) {
    setProductForm((current) => ({ ...current, [field]: value }));
  }

  async function uploadImage(file: File) {
    if (!storage || !file) return null;
    const fileRef = ref(storage, `products/${Date.now()}_${file.name}`);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    return url;
  }

  async function saveProductToFirestore() {
    if (!db) {
      setSaveMessage("Configure seu Firebase antes de salvar.");
      return;
    }

    if (!productForm.name || !productForm.price || !productForm.collection || !productForm.category) {
      setSaveMessage("Preencha nome, coleção, categoria e preço antes de salvar.");
      return;
    }

    try {
      setSavingProduct(true);
      setSaveMessage("");

      const galleryImages = productForm.gallery
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      const payload = {
        name: productForm.name,
        collection: productForm.collection,
        category: productForm.category,
        price: Number(String(productForm.price).replace(/\./g, "").replace(",", ".")) || 0,
        oldPrice: productForm.oldPrice ? Number(String(productForm.oldPrice).replace(/\./g, "").replace(",", ".")) : null,
        stock: Number(productForm.stock) || 0,
        sizes: productForm.sizes.split(",").map((item) => item.trim()).filter(Boolean),
        color: productForm.color,
        badge: productForm.badge,
        description: productForm.description,
        shortDescription: productForm.shortDescription,
        image: productForm.image,
        images: galleryImages,
        shopeeLink: productForm.shopeeLink,
        featured: productForm.featured,
        published: productForm.published,
        bestseller: productForm.bestseller,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "products"), payload);

      setSaveMessage("Produto salvo no Firestore com sucesso.");
      setProductForm({
        name: "",
        collection: "Moda Fitness",
        category: "Tops",
        price: "",
        oldPrice: "",
        stock: "",
        sizes: "P, M, G, GG",
        color: "",
        badge: "Novo",
        shortDescription: "",
        description: "",
        image: "",
        gallery: "",
        shopeeLink: "",
        featured: false,
        published: true,
        bestseller: false,
      });
    } catch (error) {
      console.error(error);
      setSaveMessage("Não foi possível salvar no Firestore.");
    } finally {
      setSavingProduct(false);
    }
  }

  function addToCart(product: any) {
    setCart((current) => {
      const found = current.find((item) => item.id === product.id);
      if (found) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  }

  return (
    <div className="min-h-screen bg-[#FFF9F7] text-[#2A1F22]">
      <div className="bg-[#6E3C47] px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-white/80">
        Moda que inspira melhoria contínua
      </div>

      <header className="border-b border-[#E9D7DB] bg-white sticky top-0 z-50">
        <div className="mx-auto flex max-w-[1600px] items-center gap-8 px-6 py-7 xl:px-10">
          <Logo />

          <nav className="hidden flex-1 items-center justify-center gap-14 text-[15px] font-semibold uppercase tracking-[0.08em] text-[#2A1F22] lg:flex">
            <a href="#colecoes" className="hover:text-[#6E3C47] transition-colors">Coleções</a>
            <a href="#reposicoes" className="hover:text-[#6E3C47] transition-colors">Reposições</a>
            <a href="#produtos" className="hover:text-[#6E3C47] transition-colors">Produtos</a>
            <a href="#mais-vendidos" className="hover:text-[#6E3C47] transition-colors">Mais vendidos</a>
            <a href="#outlet" className="hover:text-[#6E3C47] transition-colors">Outlet</a>
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <div className="hidden items-center overflow-hidden rounded-md border border-[#E5DADD] bg-[#FAF6F7] md:flex">
              <input
                placeholder="Procurar no site..."
                className="h-12 w-[260px] bg-transparent px-4 outline-none"
              />
              <button className="flex h-12 w-12 items-center justify-center border-l border-[#E5DADD] text-lg">⌕</button>
            </div>
            <button className="text-2xl text-[#2A1F22]">◦</button>
            <button className="text-2xl text-[#2A1F22]">♡</button>
            <button className="relative rounded-full bg-[#6E3C47] px-7 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-lg">
              Carrinho
              {cartCount ? (
                <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black text-xs text-white">
                  {cartCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-black">
          <img src={hero.image} alt={hero.title} className="h-[78vh] min-h-[620px] w-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 mx-auto flex max-w-[1600px] items-end px-8 pb-12 xl:px-14">
            <div className="max-w-xl text-white">
              <h1 className="text-6xl font-semibold uppercase tracking-[-0.05em] md:text-7xl">{hero.title}</h1>
              <p className="mt-4 text-2xl text-white/85">{hero.subtitle}</p>
              <button className="mt-8 rounded-full bg-white px-10 py-5 text-xl font-semibold uppercase tracking-[0.12em] text-[#2A1F22] transition hover:scale-[1.02]">
                {hero.cta}
              </button>
            </div>
          </div>
        </section>

        <section id="produtos" className="mx-auto max-w-[1300px] px-5 py-20">
          <SectionTitle title={productsLoading ? "Carregando..." : "Lançamento"} action="Ver tudo" />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {launchProductsDisplay.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={addToCart} />
            ))}
          </div>
        </section>

        <section id="colecoes" className="bg-[#F4ECEE] py-20">
          <div className="mx-auto max-w-[1300px] px-5">
            <div className="mb-10 text-center">
              <p className="text-[13px] uppercase tracking-[0.25em] text-[#C7A17A]">Moda Fitness</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {collections.map((item) => (
                <article key={item.title} className="group relative overflow-hidden rounded-md shadow-lg">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-[420px] w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-[2.2rem] font-semibold uppercase text-white">{item.title}</h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="mais-vendidos" className="mx-auto max-w-[1300px] px-5 py-20">
          <div className="mb-10 text-center">
            <p className="text-[13px] uppercase tracking-[0.25em] text-[#6E3C47]">Linha Básica</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {basicProductsDisplay.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={addToCart} />
            ))}
          </div>
        </section>
      </main>

      {isAdmin ? (
        <button
          onClick={() => setAdminOpen(true)}
          className="fixed bottom-6 right-6 z-50 rounded-full bg-[#6E3C47] px-5 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-2xl"
        >
          Admin
        </button>
      ) : null}

      {adminOpen ? (
        <div className="fixed inset-0 z-[100] bg-black/50 p-4 backdrop-blur-sm">
          <div className="mx-auto max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[2rem] bg-[#FFF9F7] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-[#C7A17A]">Painel administrativo</p>
                <h2 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-[#2A1F22]">Produtos cadastrados</h2>
              </div>
              <button
                onClick={() => setAdminOpen(false)}
                className="rounded-full border border-[#E7C5CC] px-5 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#6E3C47]"
              >
                Fechar
              </button>
            </div>

            <div className="mb-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[1.75rem] border border-[#E9D7DB] bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.25em] text-[#C7A17A]">Cadastro</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#2A1F22]">Adicionar produto</h3>
                  </div>
                  <button
                    onClick={saveProductToFirestore}
                    disabled={savingProduct}
                    className="rounded-full bg-[#6E3C47] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-60"
                  >
                    {savingProduct ? "Salvando..." : "Salvar produto"}
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8B6670]">Nome do produto</label>
                    <input value={productForm.name} onChange={(e) => handleFormChange("name", e.target.value)} className="h-12 w-full rounded-xl border border-[#E9D7DB] bg-[#FFF9F7] px-4 outline-none" placeholder="Ex: Macacão fitness premium" />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8B6670]">Coleção</label>
                    <select value={productForm.collection} onChange={(e) => handleFormChange("collection", e.target.value)} className="h-12 w-full rounded-xl border border-[#E9D7DB] bg-[#FFF9F7] px-4 outline-none">
                      <option>Moda Fitness</option>
                      <option>Linha Básica</option>
                      <option>Plus Size</option>
                      <option>Vestidos</option>
                      <option>Conjuntos</option>
                      <option>Moda Festa</option>
                      <option>Casual Chic</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8B6670]">Categoria</label>
                    <select value={productForm.category} onChange={(e) => handleFormChange("category", e.target.value)} className="h-12 w-full rounded-xl border border-[#E9D7DB] bg-[#FFF9F7] px-4 outline-none">
                      <option>Tops</option>
                      <option>Leggings</option>
                      <option>Shorts</option>
                      <option>Macacões</option>
                      <option>Blusas</option>
                      <option>Acessórios</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8B6670]">Preço da loja</label>
                    <input className="h-12 w-full rounded-xl border border-[#E9D7DB] bg-[#FFF9F7] px-4 outline-none" value={productForm.price} onChange={(e) => handleFormChange("price", e.target.value)} placeholder="129,90" />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8B6670]">Preço comparativo</label>
                    <input className="h-12 w-full rounded-xl border border-[#E9D7DB] bg-[#FFF9F7] px-4 outline-none" value={productForm.oldPrice} onChange={(e) => handleFormChange("oldPrice", e.target.value)} placeholder="169,90" />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8B6670]">Estoque</label>
                    <input className="h-12 w-full rounded-xl border border-[#E9D7DB] bg-[#FFF9F7] px-4 outline-none" value={productForm.stock} onChange={(e) => handleFormChange("stock", e.target.value)} placeholder="Ex: 25" />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8B6670]">Tamanhos</label>
                    <input className="h-12 w-full rounded-xl border border-[#E9D7DB] bg-[#FFF9F7] px-4 outline-none" value={productForm.sizes} onChange={(e) => handleFormChange("sizes", e.target.value)} placeholder="P, M, G, GG" />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8B6670]">Cor principal</label>
                    <input className="h-12 w-full rounded-xl border border-[#E9D7DB] bg-[#FFF9F7] px-4 outline-none" value={productForm.color} onChange={(e) => handleFormChange("color", e.target.value)} placeholder="Ex: Preto" />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8B6670]">Badge</label>
                    <select value={productForm.badge} onChange={(e) => handleFormChange("badge", e.target.value)} className="h-12 w-full rounded-xl border border-[#E9D7DB] bg-[#FFF9F7] px-4 outline-none">
                      <option>Novo</option>
                      <option>Destaque</option>
                      <option>Mais vendido</option>
                      <option>Oferta</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8B6670]">Descrição curta</label>
                    <textarea value={productForm.shortDescription} onChange={(e) => handleFormChange("shortDescription", e.target.value)} className="min-h-[100px] w-full rounded-xl border border-[#E9D7DB] bg-[#FFF9F7] px-4 py-3 outline-none" placeholder="Resumo do produto para a vitrine" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8B6670]">Descrição completa</label>
                    <textarea value={productForm.description} onChange={(e) => handleFormChange("description", e.target.value)} className="min-h-[140px] w-full rounded-xl border border-[#E9D7DB] bg-[#FFF9F7] px-4 py-3 outline-none" placeholder="Detalhes completos do produto, tecido, modelagem, uso e cuidados" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8B6670]">Imagem principal</label>
                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                      <input className="h-12 w-full rounded-xl border border-[#E9D7DB] bg-[#FFF9F7] px-4 outline-none" value={productForm.image} onChange={(e) => handleFormChange("image", e.target.value)} placeholder="Cole a URL da imagem principal ou caminho do Storage" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await uploadImage(file);
                          if (url) handleFormChange("image", url);
                        }}
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8B6670]">Galeria de imagens</label>
                    <textarea value={productForm.gallery} onChange={(e) => handleFormChange("gallery", e.target.value)} className="min-h-[90px] w-full rounded-xl border border-[#E9D7DB] bg-[#FFF9F7] px-4 py-3 outline-none" placeholder="Cole várias URLs, uma por linha" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-[#8B6670]">Link da Shopee</label>
                    <input className="h-12 w-full rounded-xl border border-[#E9D7DB] bg-[#FFF9F7] px-4 outline-none" value={productForm.shopeeLink} onChange={(e) => handleFormChange("shopeeLink", e.target.value)} placeholder="Link privado usado apenas no admin" />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 rounded-full border border-[#E7C5CC] px-4 py-2 text-sm text-[#6E3C47]">
                    <input type="checkbox" checked={productForm.featured} onChange={(e) => handleFormChange("featured", e.target.checked)} /> Em destaque
                  </label>
                  <label className="flex items-center gap-2 rounded-full border border-[#E7C5CC] px-4 py-2 text-sm text-[#6E3C47]">
                    <input type="checkbox" checked={productForm.published} onChange={(e) => handleFormChange("published", e.target.checked)} /> Publicado
                  </label>
                  <label className="flex items-center gap-2 rounded-full border border-[#E7C5CC] px-4 py-2 text-sm text-[#6E3C47]">
                    <input type="checkbox" checked={productForm.bestseller} onChange={(e) => handleFormChange("bestseller", e.target.checked)} /> Mais vendido
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.75rem] border border-[#E9D7DB] bg-white p-5 shadow-sm">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-[#C7A17A]">Prévia</p>
                  <div className="mt-4 overflow-hidden rounded-[1.5rem] bg-[#F3EFF0]">
                    {productForm.image ? (
                      <img src={productForm.image} alt={productForm.name || "Prévia do produto"} className="h-[360px] w-full object-cover" />
                    ) : (
                      <div className="flex h-[360px] items-center justify-center text-sm text-[#8B6670]">Prévia da imagem principal</div>
                    )}
                  </div>
                  <div className="mt-4 text-left">
                    <p className="text-xs uppercase tracking-[0.22em] text-[#8B6670]">{productForm.collection || "Coleção"}</p>
                    <h3 className="mt-2 text-2xl font-semibold text-[#2A1F22]">{productForm.name || "Nome do produto"}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#6D575D] line-clamp-2">{productForm.shortDescription || "Resumo do produto aparecerá aqui."}</p>
                    <div className="mt-4 flex items-center gap-3">
                      <span className="text-2xl font-semibold text-[#6E3C47]">{productForm.price ? formatPrice(Number(String(productForm.price).replace(/\./g, "").replace(",", ".")) || 0) : "R$ 0,00"}</span>
                      {productForm.oldPrice ? <span className="text-sm text-[#8B6670] line-through">{formatPrice(Number(String(productForm.oldPrice).replace(/\./g, "").replace(",", ".")) || 0)}</span> : null}
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-[#E9D7DB] bg-white p-5 shadow-sm text-left">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-[#C7A17A]">Ações rápidas</p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-[#6D575D]">
                    <li>• Sincronização em tempo real</li>
                    <li>• Upload para Firebase Storage</li>
                    <li>• Controle de estoque e vitrine</li>
                  </ul>
                </div>
                  {saveMessage ? <p className="mt-4 text-sm font-medium text-[#6E3C47]">{saveMessage}</p> : null}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {storeProducts.map((product) => (
                <div key={`admin-${product.id}`} className="rounded-[1.75rem] border border-[#E9D7DB] bg-white p-4 shadow-sm">
                  <div className="flex gap-4">
                    <img src={product.image} alt={product.name} className="h-28 w-24 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1 text-left">
                      <h3 className="line-clamp-2 text-lg font-semibold text-[#2A1F22]">{product.name}</h3>
                      <p className="mt-2 text-sm text-[#6D575D]">Preço: {formatPrice(product.price)}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button className="rounded-full border border-[#E7C5CC] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#6E3C47]">
                          Editar
                        </button>
                        <a
                          href={product.shopeeLink}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full bg-[#6E3C47] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white"
                        >
                          Shopee
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <footer className="bg-black text-white py-16">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="mb-16 text-center space-y-6">
            <h2 className="text-7xl font-semibold tracking-[-0.06em]">Toda Bela</h2>
            <p className="mx-auto max-w-5xl text-xl text-white/80 font-light italic">
              Toda Bela é mais que uma marca — é um movimento de evolução. Inspiramos presença, propósito e estilo em cada detalhe.
            </p>
          </div>
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 border-t border-white/10 pt-12 text-left">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-[#C7A17A]">Atendimento</h3>
              <p className="text-white/70">Seg a Sex | 08h às 18h</p>
              <p className="text-white font-bold">WhatsApp: (11) 99999-9999</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-[#C7A17A]">Links Úteis</h3>
              <p className="text-white/70 cursor-pointer hover:text-white transition-colors">Acompanhar Pedido</p>
              <p className="text-white/70 cursor-pointer hover:text-white transition-colors">Trocas e Devoluções</p>
            </div>
            <div className="space-y-4 lg:col-span-2">
              <h3 className="text-xl font-semibold text-[#C7A17A]">Newsletter</h3>
              <p className="text-white/70 italic">Receba novidades e ofertas exclusivas.</p>
              <div className="flex gap-2">
                <input className="bg-white/10 border-none rounded-full px-6 py-3 flex-1 text-sm outline-none focus:ring-1 focus:ring-[#C7A17A]" placeholder="Seu melhor e-mail" />
                <button className="bg-white text-black px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#C7A17A] transition-all">Assinar</button>
              </div>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] uppercase tracking-widest text-white/30">© 2024 Toda Bela • Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
