/**
 * otimizar-imagens.mjs — converte PNG/JPG para WebP e atualiza as referências.
 *
 * Screenshot de site em PNG é desperdício: PNG é feito pra imagem com poucas
 * cores ou transparência, não pra captura de tela. WebP corta ~80% sem
 * diferença visível.
 *
 * Uso: node scripts/otimizar-imagens.mjs
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const RAIZ = path.resolve(import.meta.dirname, "..");
const QUALIDADE = 82;              // acima disso o ganho de tamanho não compensa
const MAX_LARGURA = 1600;          // ninguém precisa de screenshot maior que isso

/** Ícone e logo ficam em PNG: transparência e tamanho pequeno já resolvem. */
const MANTER_PNG = /(favicon|logo|icon|sprite)/i;

function listar(dir, out = []) {
  for (const nome of fs.readdirSync(dir)) {
    const alvo = path.join(dir, nome);
    const st = fs.statSync(alvo);
    if (st.isDirectory()) {
      if (nome === "node_modules" || nome === ".git" || nome === "scripts") continue;
      listar(alvo, out);
    } else if (/\.(png|jpe?g)$/i.test(nome)) {
      out.push(alvo);
    }
  }
  return out;
}

const imagens = listar(RAIZ).filter((f) => !MANTER_PNG.test(path.basename(f)));
const renomeados = new Map();
let antes = 0, depois = 0, convertidas = 0;

for (const arquivo of imagens) {
  const original = fs.statSync(arquivo).size;

  // Não vale converter arquivo já pequeno — o overhead do formato come o ganho
  if (original < 15 * 1024) continue;

  const destino = arquivo.replace(/\.(png|jpe?g)$/i, ".webp");

  try {
    const img = sharp(arquivo);
    const meta = await img.metadata();

    await img
      .resize({ width: Math.min(meta.width || MAX_LARGURA, MAX_LARGURA), withoutEnlargement: true })
      .webp({ quality: QUALIDADE })
      .toFile(destino);

    const novo = fs.statSync(destino).size;

    // Se o WebP ficou maior (acontece com imagem já otimizada), descarta
    if (novo >= original) {
      fs.unlinkSync(destino);
      continue;
    }

    antes += original;
    depois += novo;
    convertidas++;

    renomeados.set(
      path.relative(RAIZ, arquivo).replace(/\\/g, "/"),
      path.relative(RAIZ, destino).replace(/\\/g, "/")
    );
    fs.unlinkSync(arquivo);
  } catch (e) {
    console.warn(`  falhou: ${path.basename(arquivo)} — ${e.message}`);
  }
}

// Atualiza as referências no HTML e CSS
const textuais = [];
(function varrer(dir) {
  for (const nome of fs.readdirSync(dir)) {
    const alvo = path.join(dir, nome);
    if (fs.statSync(alvo).isDirectory()) {
      if (nome === "node_modules" || nome === ".git") continue;
      varrer(alvo);
    } else if (/\.(html|css|js)$/i.test(nome)) {
      textuais.push(alvo);
    }
  }
})(RAIZ);

let arquivosTocados = 0;
for (const arquivo of textuais) {
  let texto = fs.readFileSync(arquivo, "utf-8");
  const antesTexto = texto;

  for (const [de, para] of renomeados) {
    // Só o nome do arquivo, pra pegar caminho relativo de qualquer profundidade
    const nomeDe = path.basename(de);
    const nomePara = path.basename(para);
    if (texto.includes(nomeDe)) {
      texto = texto.split(nomeDe).join(nomePara);
    }
  }

  if (texto !== antesTexto) {
    fs.writeFileSync(arquivo, texto, "utf-8");
    arquivosTocados++;
  }
}

console.log(`\n  convertidas   : ${convertidas} imagens`);
console.log(`  antes         : ${(antes / 1024 / 1024).toFixed(1)} MB`);
console.log(`  depois        : ${(depois / 1024 / 1024).toFixed(1)} MB`);
console.log(`  economia      : ${(((antes - depois) / antes) * 100).toFixed(0)}%`);
console.log(`  refs ajustadas: ${arquivosTocados} arquivos\n`);
