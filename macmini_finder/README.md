# Buscador de Mac Mini M2 Pro 32GB (skill tipo Firecrawl)

Busca usados/seminovos/recondicionados em Mercado Livre, OLX e Back Market,
filtra **só 32GB de RAM**, marca anúncios suspeitos e gera tabela ordenada por preço.

## Por que não roda no Claude Code na web (cloud)

O ambiente cloud tem **política de rede em allowlist**: só sai para domínios de
infra (pypi, github). Marketplaces e a API do Firecrawl retornam
`403 "Host not in allowlist"`. **Rode na sua máquina local**, onde a rede é a sua.

---

## Opção 1 — Firecrawl (igual ao pedido original)

```bash
pip install requests
export FIRECRAWL_API_KEY="fc-..."     # crie em https://firecrawl.dev (tem plano free)
python3 buscar_macmini.py             # gera resultado.md
```

Usa `search` (já traz conteúdo, economiza créditos) e só gasta `extract` nos
anúncios que mencionam 32GB.

## Opção 2 — Sem API key / sem custo (Playwright)

Se não quiser usar Firecrawl, use um navegador real (passa pelo anti-bot porque
é um Chromium de verdade na sua máquina):

```bash
pip install playwright
playwright install chromium
# depois adapte: page.goto(url), page.content(), e reaproveite as funções
# de parsing/heurística (parece_m2_pro, menciona_32, extrair_preco) deste script.
```

---

## Regras aplicadas

- **Descarta** qualquer anúncio sem 32GB confirmado de RAM.
- Anúncio sem RAM clara → seção **"RAM não confirmada"** (cheque manual).
- **Pegadinha dos 16GB:** o M2 Pro vem com 16GB de base; 32GB é upgrade. O título
  às vezes engana — confirme com foto de "Sobre Este Mac".
- **Modelo:** Mac mini M2 Pro = **A2816**. Se diz **A2686**, é M2 *base* → descartar.
- **Suspeitos sinalizados:** preço muito abaixo da média, vendedor sem reputação,
  "só PIX" + pressa.
- **Prioridade geográfica:** anúncios da **Grande Vitória / ES** (Vitória, Vila
  Velha, Serra, Cariacica, Viana, Guarapari, Fundão) vão para o **topo** da tabela
  e recebem a flag `Grande Vitoria/ES`; dentro de cada grupo, ordena por preço.
  Edite a lista `GRANDE_VITORIA` no script para ajustar as cidades.
- Orçamento de referência: R$ 5.500 (usado só para sinalizar, não filtra).

## Saída

`resultado.md` — tabela ordenada por preço (menor → maior) + lista de RAM não
confirmada. Edite `BUSCAS` no script para mirar outras regiões/termos.
