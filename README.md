# felipe-portifolio

Portfólio pessoal — site estático (HTML/CSS/JS puro, template Unify comprado por Felipe). Sem build, sem framework.

## Origem

Migrado em 27/07/2026 do material antigo (`Desktop/felipe`, de 2017), que tinha **258,6 MB em 16.478 arquivos** — quase tudo demo do template que a página nunca usava.

O que foi feito na migração:

| Etapa | Resultado |
|---|---|
| Extração do que o `index.html` realmente referencia | 258,6 MB → 41,3 MB (210 arquivos) |
| Screenshots de projeto PNG → WebP | −86% (32,9 MB → 4,5 MB) |
| Remoção de 16 pacotes de ícone não usados (só ficaram `communication` e `hotel-restaurant`) | −4,2 MB |
| Remoção de blocos mortos do template (aba oculta com texto lorem ipsum em latim; seção "Parceiros" com logos falsos — Hubspot, Circle CI — que nunca existiram) | página mais curta e honesta |
| Fix de dois links quebrados desde 2017 (logo do cabeçalho e favicon, ambos com caminho relativo errado) | logo agora aparece na navbar |

**Resultado: 8,7 MB, 137 arquivos** (de 258,6 MB / 16.478 — redução de 96,6%). Validado via servidor local: todos os 90 recursos referenciados resolvendo 200, e zero arquivo órfão (checado por script, não só visualmente).

## Scripts de manutenção

```bash
npm install          # só pra rodar os scripts abaixo (sharp não é runtime do site)
npm run otimizar-imagens   # converte PNG/JPG novo pra WebP
npm run limpar-icones      # remove famílias de ícone não referenciadas no HTML
```

Rodar de novo se adicionar projeto novo ao portfólio com screenshot em PNG.

## O que ainda é 2017

O conteúdo (textos, projetos listados, "Analista de sistemas" como título) é o original — **serve de base**, não de versão final. As barras de skill antigas (Web Design 80%, jQuery 80%...) foram mantidas ocultas no HTML, não apagadas, caso sirvam de referência.
