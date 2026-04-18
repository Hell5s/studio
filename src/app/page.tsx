
"use client";

import { useEffect, useMemo, useState } from "react";
import { firebaseConfig } from "@/firebase/config";
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

// Inicialização segura do Firebase (estilo original)
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
      <div className="relative overflow-hidden bg-[#F3EFF0] aspect-[3/4]">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <button className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-xl text-[#6E3C47] shadow-sm hover:bg-[#6E3C47] hover:text-white transition-all">
          ♡
        </button>
      </div>
      <div className="px-1 pb-4 pt-5 text-center flex flex-col items-center">
        <h3 className="line-clamp-2 text-[15px] uppercase leading-tight tracking-tight text-[#3A3133] font-medium min-h-[2.5rem]">
          {product.name}
        </h3>
        <p className="mt-3 text-[2rem] font-light text-[#2A1F22] leading-none">
          {formatPrice(product.price)}
        </p>
        <p className="text-sm text-[#6D575D] font-medium italic">
          ou 10x de {formatPrice(product.price / 10)}
        </p>
        <button
          onClick={() => onAdd(product)}
          className="mt-4 rounded-full border border-[#E7C5CC] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#6E3C47] transition hover:bg-[#F7E8EA] hover:border-[#6E3C47]"
        >
          Adicionar
        </button>
      </div>
    </article>
  );
}

function SectionTitle({ title, action }: any) {
  return (
    <div className="mb-12 flex items-center justify-between gap-4">
      <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.04em] text-[#2A1F22]">{title}</h2>
      {action ? <button className="text-sm font-bold uppercase tracking-widest text-[#C7A17A] underline underline-offset-8">{action}</button> : null}
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
    const basics = storefrontProducts.filter(p => p.collection === 'Linha Básica' || p.category === 'Básicos');
    return basics.length ? basics.slice(0, 5) : storefrontProducts.slice(4, 9);
  }, [storefrontProducts]);

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

          <nav className="hidden flex-1 items-center justify-center gap-14 text-[15px] font-bold uppercase tracking-[0.08em] text-[#2A1F22] lg:flex">
            <a href="#colecoes" className="hover:text-[#6E3C47] transition-colors">Coleções</a>
            <a href="#reposicoes" className="hover:text-[#6E3C47] transition-colors">Reposições</a>
            <a href="#produtos" className="hover:text-[#6E3C47] transition-colors">Produtos</a>
            <a href="#mais-vendidos" className="hover:text-[#6E3C47] transition-colors">Favoritos</a>
            <a href="#outlet" className="hover:text-[#6E3C47] transition-colors">Outlet</a>
          </nav>

          <div className="ml-auto flex items-center gap-6">
            <div className="hidden items-center overflow-hidden rounded-md border border-[#E5DADD] bg-[#FAF6F7] md:flex">
              <input
                placeholder="Procurar no site..."
                className="h-12 w-[260px] bg-transparent px-4 outline-none text-sm"
              />
              <button className="flex h-12 w-12 items-center justify-center border-l border-[#E5DADD] text-lg text-[#6E3C47]">⌕</button>
            </div>
            
            <button className="relative flex items-center gap-2 rounded-full bg-[#6E3C47] px-7 py-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white hover:bg-black transition-all shadow-lg">
              Carrinho
              {cartCount ? (
                <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black text-xs font-bold text-white shadow-md">
                  {cartCount}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-black h-[80vh] min-h-[600px]">
          <img
            src={hero.image}
            alt={hero.title}
            className="h-full w-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 mx-auto flex max-w-[1600px] items-end px-8 pb-20 xl:px-14">
            <div className="max-w-2xl text-white space-y-6">
              <h1 className="text-6xl md:text-8xl font-semibold uppercase tracking-[-0.05em] leading-[0.9]">
                {hero.title}
              </h1>
              <p className="text-2xl text-white/85 font-light italic">
                {hero.subtitle}
              </p>
              <button className="mt-8 rounded-full bg-white px-12 py-5 text-lg font-bold uppercase tracking-widest text-[#2A1F22] transition-all hover:scale-105 shadow-2xl">
                {hero.cta}
              </button>
            </div>
          </div>
        </section>

        <section id="produtos" className="mx-auto max-w-[1400px] px-6 py-24 md:py-32">
          <SectionTitle title={productsLoading ? "Curadoria..." : "Lançamentos"} action="Ver tudo" />
          <div className="grid gap-8 grid-cols-2 lg:grid-cols-4">
            {launchProductsDisplay.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={addToCart} />
            ))}
          </div>
        </section>

        <section id="colecoes" className="bg-[#F4ECEE] py-24 md:py-32">
          <div className="mx-auto max-w-[1400px] px-6 text-center">
            <div className="mb-16">
              <p className="text-[13px] font-bold uppercase tracking-[0.3em] text-[#C7A17A]">Curadoria Toda Bela</p>
            </div>
            <div className="grid gap-6 grid-cols-2 lg:grid-cols-4 text-left">
              {collections.map((item) => (
                <article key={item.title} className="group relative overflow-hidden rounded-2xl shadow-xl aspect-[3/4]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8">
                    <h3 className="text-4xl font-semibold uppercase text-white tracking-tight">{item.title}</h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="mais-vendidos" className="mx-auto max-w-[1400px] px-6 py-24 md:py-32">
          <div className="mb-16 text-center">
            <p className="text-[13px] font-bold uppercase tracking-[0.3em] text-[#6E3C47]">Indispensáveis</p>
          </div>
          <div className="grid gap-6 grid-cols-2 lg:grid-cols-5">
            {basicProductsDisplay.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={addToCart} />
            ))}
          </div>
        </section>
      </main>

      {isAdmin ? (
        <button
          onClick={() => setAdminOpen(true)}
          className="fixed bottom-8 right-8 z-50 rounded-full bg-[#6E3C47] px-8 py-5 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-2xl hover:scale-105 transition-all"
        >
          Painel Boutique
        </button>
      ) : null}

      {adminOpen ? (
        <div className="fixed inset-0 z-[100] bg-black/60 p-4 backdrop-blur-md">
          <div className="mx-auto max-h-[92vh] w-full max-w-7xl overflow-y-auto rounded-[3rem] bg-[#FFF9F7] p-10 shadow-2xl scrollbar-hide">
            <div className="mb-10 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#C7A17A]">Curadoria Administrativa</p>
                <h2 className="mt-2 text-5xl font-semibold tracking-[-0.04em] text-[#2A1F22]">Gerenciamento</h2>
              </div>
              <button
                onClick={() => setAdminOpen(false)}
                className="rounded-full border-2 border-[#E7C5CC] px-8 py-4 text-xs font-bold uppercase tracking-[0.14em] text-[#6E3C47] hover:bg-[#6E3C47] hover:text-white transition-all"
              >
                Sair do Painel
              </button>
            </div>

            <div className="mb-12 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[2.5rem] border border-[#E9D7DB] bg-white p-8 shadow-sm">
                <div className="mb-8 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#C7A17A]">Inventário</p>
                    <h3 className="mt-2 text-3xl font-semibold text-[#2A1F22]">Adicionar Item</h3>
                  </div>
                  <button
                    onClick={saveProductToFirestore}
                    disabled={savingProduct}
                    className="rounded-full bg-[#6E3C47] px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white disabled:opacity-60 shadow-xl"
                  >
                    {savingProduct ? "Reservando..." : "Salvar na Maison"}
                  </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 ml-4 block text-[10px] font-bold uppercase tracking-widest text-[#8B6670]">Nome do Produto</label>
                    <input value={productForm.name} onChange={(e) => handleFormChange("name", e.target.value)} className="h-14 w-full rounded-2xl border border-[#E9D7DB] bg-[#FFF9F7] px-6 outline-none text-sm focus:ring-2 focus:ring-[#6E3C47]/10 transition-all" placeholder="Ex: Macacão Fitness Premium Satin" />
                  </div>

                  <div>
                    <label className="mb-2 ml-4 block text-[10px] font-bold uppercase tracking-widest text-[#8B6670]">Coleção</label>
                    <select value={productForm.collection} onChange={(e) => handleFormChange("collection", e.target.value)} className="h-14 w-full rounded-2xl border border-[#E9D7DB] bg-[#FFF9F7] px-6 outline-none text-sm appearance-none">
                      <option>Moda Fitness</option>
                      <option>Linha Básica</option>
                      <option>Plus Size</option>
                      <option>Vestidos</option>
                      <option>Conjuntos</option>
                      <option>Casual Chic</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 ml-4 block text-[10px] font-bold uppercase tracking-widest text-[#8B6670]">Categoria</label>
                    <select value={productForm.category} onChange={(e) => handleFormChange("category", e.target.value)} className="h-14 w-full rounded-2xl border border-[#E9D7DB] bg-[#FFF9F7] px-6 outline-none text-sm appearance-none">
                      <option>Tops</option>
                      <option>Leggings</option>
                      <option>Shorts</option>
                      <option>Macacões</option>
                      <option>Blusas</option>
                      <option>Acessórios</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 ml-4 block text-[10px] font-bold uppercase tracking-widest text-[#8B6670]">Preço Maison (R$)</label>
                    <input className="h-14 w-full rounded-2xl border border-[#E9D7DB] bg-[#FFF9F7] px-6 outline-none text-sm" value={productForm.price} onChange={(e) => handleFormChange("price", e.target.value)} placeholder="129,90" />
                  </div>

                  <div>
                    <label className="mb-2 ml-4 block text-[10px] font-bold uppercase tracking-widest text-[#8B6670]">Preço de Vitrine (R$)</label>
                    <input className="h-14 w-full rounded-2xl border border-[#E9D7DB] bg-[#FFF9F7] px-6 outline-none text-sm" value={productForm.oldPrice} onChange={(e) => handleFormChange("oldPrice", e.target.value)} placeholder="169,90" />
                  </div>

                  <div>
                    <label className="mb-2 ml-4 block text-[10px] font-bold uppercase tracking-widest text-[#8B6670]">Estoque Total</label>
                    <input className="h-14 w-full rounded-2xl border border-[#E9D7DB] bg-[#FFF9F7] px-6 outline-none text-sm" value={productForm.stock} onChange={(e) => handleFormChange("stock", e.target.value)} placeholder="Ex: 25" />
                  </div>

                  <div>
                    <label className="mb-2 ml-4 block text-[10px] font-bold uppercase tracking-widest text-[#8B6670]">Tamanhos</label>
                    <input className="h-14 w-full rounded-2xl border border-[#E9D7DB] bg-[#FFF9F7] px-6 outline-none text-sm" value={productForm.sizes} onChange={(e) => handleFormChange("sizes", e.target.value)} placeholder="P, M, G, GG" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 ml-4 block text-[10px] font-bold uppercase tracking-widest text-[#8B6670]">Editorial Principal (Imagem)</label>
                    <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                      <input className="h-14 w-full rounded-2xl border border-[#E9D7DB] bg-[#FFF9F7] px-6 outline-none text-sm" value={productForm.image} onChange={(e) => handleFormChange("image", e.target.value)} placeholder="URL da foto principal" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await uploadImage(file);
                          if (url) handleFormChange("image", url);
                        }}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="flex items-center justify-center rounded-2xl border-2 border-dashed border-[#E7C5CC] px-8 h-14 text-[10px] font-bold uppercase tracking-widest text-[#6E3C47] cursor-pointer hover:bg-[#F7E8EA] transition-all">
                        Upload
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-4">
                  <label className="flex items-center gap-3 rounded-2xl border border-[#E7C5CC] px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-[#6E3C47] cursor-pointer">
                    <input type="checkbox" checked={productForm.featured} onChange={(e) => handleFormChange("featured", e.target.checked)} className="accent-[#6E3C47]" /> Destaque Home
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl border border-[#E7C5CC] px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-[#6E3C47] cursor-pointer">
                    <input type="checkbox" checked={productForm.published} onChange={(e) => handleFormChange("published", e.target.checked)} className="accent-[#6E3C47]" /> Publicado
                  </label>
                  <label className="flex items-center gap-3 rounded-2xl border border-[#E7C5CC] px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-[#6E3C47] cursor-pointer">
                    <input type="checkbox" checked={productForm.bestseller} onChange={(e) => handleFormChange("bestseller", e.target.checked)} className="accent-[#6E3C47]" /> Mais Vendido
                  </label>
                </div>
              </div>

              <div className="space-y-8">
                <div className="rounded-[2.5rem] border border-[#E9D7DB] bg-white p-8 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#C7A17A]">Preview Vitrine</p>
                  <div className="mt-6 overflow-hidden rounded-[2rem] bg-[#F3EFF0] aspect-[3/4] relative">
                    {productForm.image ? (
                      <img src={productForm.image} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm font-bold uppercase tracking-widest text-[#8B6670]/30">Aguardando editorial</div>
                    )}
                  </div>
                  <div className="mt-8 text-center space-y-3">
                    <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#8B6670]">{productForm.collection}</p>
                    <h3 className="text-3xl font-semibold text-[#2A1F22]">{productForm.name || "Nome da Peça"}</h3>
                    <p className="text-4xl font-light text-[#6E3C47]">{formatPrice(productForm.price)}</p>
                  </div>
                </div>

                {saveMessage && (
                  <div className="p-6 rounded-2xl bg-[#6E3C47]/5 border border-[#6E3C47]/10 text-center">
                    <p className="text-sm font-bold text-[#6E3C47] italic">{saveMessage}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-[#E9D7DB] pt-10">
              <h3 className="mb-8 text-3xl font-semibold text-[#2A1F22]">Catálogo Maison</h3>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {storeProducts.map((product) => (
                  <div key={`admin-${product.id}`} className="rounded-[2rem] border border-[#E9D7DB] bg-white p-5 shadow-sm flex gap-6 hover:shadow-lg transition-all">
                    <div className="h-32 w-24 rounded-xl overflow-hidden shrink-0 shadow-inner">
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <h3 className="line-clamp-2 text-lg font-bold text-[#2A1F22] uppercase tracking-tight">{product.name}</h3>
                        <p className="text-sm text-[#6E3C47] font-light">{formatPrice(product.price)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="rounded-full border border-[#E7C5CC] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#6E3C47] hover:bg-[#F7E8EA] transition-all">Editar</button>
                        <span className="text-[8px] font-mono text-muted-foreground self-center ml-auto">ID: {product.id.slice(-6).toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <footer className="bg-black text-white pt-24 pb-12">
        <div className="mx-auto max-w-[1440px] px-8 xl:px-14">
          <div className="mb-24 text-center space-y-10">
            <h2 className="text-7xl md:text-9xl font-semibold tracking-[-0.06em]">Toda Bela</h2>
            <p className="mx-auto max-w-5xl text-xl text-white/80 font-light italic leading-relaxed">
              Toda Bela é mais que uma marca — é um movimento de evolução. Inspiramos presença, propósito e estilo em cada detalhe. 
              Para quem vive com intenção e constrói sua própria jornada de excelência.
            </p>
          </div>

          <div className="grid gap-16 md:grid-cols-2 lg:grid-cols-4 border-t border-white/10 pt-16">
            <div className="space-y-6">
              <h3 className="text-xl font-bold uppercase tracking-widest text-[#C7A17A]">Atendimento</h3>
              <div className="space-y-3 text-white/60 font-light italic">
                <p>Seg a Qui 07h-17h | Sex 07h-16h</p>
                <p className="text-white font-bold not-italic">WhatsApp: (11) 99999-9999</p>
                <p>contato@todobela.com.br</p>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-xl font-bold uppercase tracking-widest text-[#C7A17A]">Suporte</h3>
              <div className="space-y-3 text-white/60 font-light flex flex-col items-start">
                <button className="hover:text-white transition-colors">Acompanhar Pedido</button>
                <button className="hover:text-white transition-colors">Trocas e Devoluções</button>
                <button className="hover:text-white transition-colors">Política de Privacidade</button>
              </div>
            </div>
            <div className="space-y-6 lg:col-span-2 bg-white/5 p-10 rounded-3xl border border-white/5">
              <h3 className="text-xl font-bold uppercase tracking-widest text-[#C7A17A]">Newsletter</h3>
              <p className="text-white/60 font-light italic mb-6">Receba as novidades da boutique em seu melhor e-mail.</p>
              <div className="flex gap-4">
                <input placeholder="seu@email.com" className="flex-1 bg-white/10 border-none rounded-full px-6 text-sm outline-none focus:ring-1 focus:ring-[#C7A17A]" />
                <button className="bg-white text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-[#C7A17A] transition-all">Assinar</button>
              </div>
            </div>
          </div>
          
          <div className="mt-24 pt-12 border-t border-white/5 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-white/20">© 2026 Toda Bela • Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
