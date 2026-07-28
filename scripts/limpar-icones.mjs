/**
 * limpar-icones.mjs — remove os pacotes de ícone que a página não usa.
 *
 * O template traz 18 famílias (natal, comida, esportes, clima…). Um portfólio
 * de dev usa duas. O resto é download que o visitante paga sem receber nada.
 */
import fs from "fs";
import path from "path";

const RAIZ = path.resolve(import.meta.dirname, "..");
const PRO = path.join(RAIZ, "assets", "vendor", "icon-line-pro");
const STYLE = path.join(PRO, "style.css");
const HTML = path.join(RAIZ, "index.html");

// Descobre pelo HTML quais famílias são realmente usadas
const html = fs.readFileSync(HTML, "utf-8");
const usados = new Set();
for (const m of html.matchAll(/icon-([a-z-]+?)-\d{3}/g)) usados.add(m[1]);

console.log(`  famílias usadas no HTML: ${[...usados].join(", ") || "(nenhuma)"}`);

const css = fs.readFileSync(STYLE, "utf-8");

/* O style.css é uma sequência de blocos comentados por família:
     /* Christmas *\/  @font-face{...} [data-icon-christmas]{...} .icon-christmas-001{...}
   Corta nos comentários de seção e mantém só os blocos das famílias usadas. */
const partes = css.split(/(?=\/\*\s*[A-Z][^*]*\*\/)/);

const mantidas = partes.filter((bloco, i) => {
  if (i === 0) return true;                       // @charset e cabeçalho
  // A família aparece nos seletores e nos caminhos de fonte do bloco
  return [...usados].some(
    (fam) => bloco.includes(`icon-${fam}-`) || bloco.includes(`${fam}/webfont/`)
  );
});

fs.writeFileSync(STYLE, mantidas.join(""), "utf-8");
console.log(`  style.css: ${partes.length - 1} blocos → ${mantidas.length - 1} mantidos`);

// Remove as pastas das famílias não usadas
let removidas = 0, bytes = 0;
for (const nome of fs.readdirSync(PRO)) {
  const alvo = path.join(PRO, nome);
  if (!fs.statSync(alvo).isDirectory()) continue;
  if (usados.has(nome)) continue;

  const tamanho = (function pesar(dir) {
    let s = 0;
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      const st = fs.statSync(p);
      s += st.isDirectory() ? pesar(p) : st.size;
    }
    return s;
  })(alvo);

  fs.rmSync(alvo, { recursive: true, force: true });
  removidas++;
  bytes += tamanho;
}

console.log(`  pastas removidas: ${removidas}  (${(bytes / 1024 / 1024).toFixed(1)} MB)\n`);
