#!/usr/bin/env python3
"""
Busca de mercado: Mac Mini M2 Pro (2023) 32GB / 512GB+ usado/seminovo/recondicionado.

Replica o fluxo "Firecrawl" pedido: search -> extract -> filtra 32GB ->
marca suspeitos -> tabela markdown ordenada por preco.

Por que existe: os marketplaces BR (Mercado Livre, OLX, Back Market) bloqueiam
acesso automatizado (HTTP 403). O Firecrawl contorna isso com proxies + render.
Rode este script NA SUA MAQUINA LOCAL (rede residencial), nao no ambiente cloud
com allowlist de rede.

Uso:
    export FIRECRAWL_API_KEY="fc-xxxxxxxx"     # pegue em https://firecrawl.dev
    pip install requests
    python3 buscar_macmini.py                  # gera resultado.md

Sem API key? Veja o README (alternativa com Playwright, sem custo de creditos).
"""

import os
import re
import sys
import json
import time
import requests

API_KEY = os.environ.get("FIRECRAWL_API_KEY")
BASE = "https://api.firecrawl.dev/v1"
ORCAMENTO_REF = 5500.0  # R$ de referencia (so para sinalizar, nao filtra)

# ---- Criterios obrigatorios ----
RAM_ALVO = 32
SSD_MIN = 512

# ---- Grande Vitoria / ES: prioridade geografica ----
# Anuncios nessas cidades vao para o topo da tabela (e depois por preco).
GRANDE_VITORIA = [
    "vitoria", "vila velha", "serra", "cariacica", "viana",
    "guarapari", "fundao", "espirito santo", "grande vitoria", " es ", "/es",
]

# ---- Fontes: query do search do Firecrawl (search ja traz conteudo) ----
# OLX recebe varias buscas miradas na Grande Vitoria/ES.
BUSCAS = [
    "Mac Mini M2 Pro 32GB usado site:mercadolivre.com.br",
    "Mac Mini M2 Pro 32GB recondicionado Back Market Brasil",
    # OLX — Grande Vitoria / ES
    "Mac Mini M2 Pro 32GB seminovo OLX Vitoria Espirito Santo",
    "Mac Mini M2 Pro 32GB usado OLX Vila Velha Serra Cariacica",
    "Mac Mini M2 Pro 32GB site:olx.com.br estado-es",
]

# Schema do que queremos extrair de cada anuncio promissor (firecrawl extract)
EXTRACT_SCHEMA = {
    "type": "object",
    "properties": {
        "titulo": {"type": "string"},
        "chip": {"type": "string", "description": "Confirmar M2 Pro vs M2 base"},
        "ram_gb": {"type": "integer"},
        "ssd_gb": {"type": "integer"},
        "estado": {"type": "string", "description": "novo/usado/recondicionado"},
        "preco_brl": {"type": "number"},
        "preco_pix_brl": {"type": "number"},
        "vendedor": {"type": "string"},
        "reputacao": {"type": "string"},
        "localizacao": {"type": "string"},
    },
}

EXTRACT_PROMPT = (
    "Extraia os dados deste anuncio de Mac Mini. Confirme se o chip e M2 PRO "
    "(nao M2 base). RAM em GB (atencao: M2 Pro base vem com 16GB; 32GB e upgrade). "
    "SSD em GB. Estado, preco em reais, preco no PIX se houver, vendedor, "
    "reputacao do vendedor e localizacao. Se um campo nao existir, deixe vazio."
)


def _post(path, payload, tries=4):
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    for i in range(tries):
        try:
            r = requests.post(f"{BASE}{path}", json=payload, headers=headers, timeout=120)
            if r.status_code == 200:
                return r.json()
            if r.status_code in (429, 502, 503):
                time.sleep(2 ** i)
                continue
            print(f"  ! {path} HTTP {r.status_code}: {r.text[:200]}", file=sys.stderr)
            return None
        except requests.RequestException as e:
            print(f"  ! erro de rede ({e}); retry...", file=sys.stderr)
            time.sleep(2 ** i)
    return None


def firecrawl_search(query, limit=8):
    """search ja retorna conteudo em markdown -> economiza creditos."""
    data = _post("/search", {
        "query": query,
        "limit": limit,
        "scrapeOptions": {"formats": ["markdown"]},
    })
    return (data or {}).get("data", []) if data else []


def firecrawl_extract(urls):
    data = _post("/extract", {
        "urls": urls,
        "prompt": EXTRACT_PROMPT,
        "schema": EXTRACT_SCHEMA,
    })
    return (data or {}).get("data") if data else None


# ---- heuristicas para pre-filtrar resultados do search (sem gastar extract) ----
def parece_m2_pro(txt):
    t = txt.lower()
    return "m2 pro" in t or "m2pro" in t

def menciona_32(txt):
    return bool(re.search(r"32\s?gb", txt.lower()))

def menciona_16(txt):
    return bool(re.search(r"16\s?gb", txt.lower()))

def extrair_preco(txt):
    m = re.findall(r"r\$\s?([\d\.]+,\d{2}|\d[\d\.]*)", txt.lower())
    precos = []
    for x in m:
        x = x.replace(".", "").replace(",", ".")
        try:
            v = float(x)
            if 1500 <= v <= 30000:  # faixa plausivel
                precos.append(v)
        except ValueError:
            pass
    return min(precos) if precos else None


def eh_grande_vitoria(item):
    """True se o anuncio parece ser da Grande Vitoria / ES."""
    alvo = f"{item.get('localizacao','')} {item.get('url','')}".lower()
    return any(cidade in alvo for cidade in GRANDE_VITORIA)


def suspeito(item):
    flags = []
    p = item.get("preco_brl")
    if p and p < 3500:
        flags.append("preco muito abaixo da media")
    rep = (item.get("reputacao") or "").lower()
    if not rep or "sem" in rep or "nova" in rep:
        flags.append("vendedor sem/baixa reputacao")
    return flags


def fmt(v):
    return v if v not in (None, "", 0) else "nao informado"


def main():
    if not API_KEY:
        sys.exit("ERRO: defina FIRECRAWL_API_KEY. Veja o README.")

    candidatos = []  # resultados crus do search
    for q in BUSCAS:
        print(f"[search] {q}", file=sys.stderr)
        for r in firecrawl_search(q, limit=8):
            md = r.get("markdown", "") or ""
            url = r.get("url") or r.get("metadata", {}).get("sourceURL", "")
            titulo = r.get("title") or r.get("metadata", {}).get("title", "")
            blob = f"{titulo}\n{md}"
            if not parece_m2_pro(blob):
                continue
            candidatos.append({"url": url, "titulo": titulo, "blob": blob})

    # pre-filtro: prioriza quem menciona 32GB para gastar extract so neles
    promissores = [c for c in candidatos if menciona_32(c["blob"])][:12]
    urls = list({c["url"] for c in promissores if c["url"]})
    print(f"[extract] {len(urls)} anuncios promissores", file=sys.stderr)

    extraidos = firecrawl_extract(urls) if urls else None
    # firecrawl extract pode retornar dict unico ou lista; normaliza
    if isinstance(extraidos, dict):
        extraidos = [extraidos]
    extraidos = extraidos or []

    aprovados, ram_nao_conf = [], []
    for it in extraidos:
        chip_ok = "pro" in (it.get("chip") or "").lower()
        ram = it.get("ram_gb")
        ssd = it.get("ssd_gb") or 0
        if ram == RAM_ALVO and chip_ok and (ssd == 0 or ssd >= SSD_MIN):
            it["_es"] = eh_grande_vitoria(it)
            it["_flags"] = (["Grande Vitoria/ES"] if it["_es"] else []) + suspeito(it)
            aprovados.append(it)
        elif ram in (None, 0):
            ram_nao_conf.append(it)
        # ram == 16 ou chip nao-pro -> descartado silenciosamente

    # Prioriza Grande Vitoria/ES; dentro de cada grupo, ordena por preco.
    aprovados.sort(key=lambda x: (0 if x.get("_es") else 1, x.get("preco_brl") or 9e9))

    # ---- saida markdown ----
    out = ["# Mac Mini M2 Pro 32GB — resultados\n"]
    out.append("| # | Preco | PIX | Titulo | Chip | RAM | SSD | Estado | Vendedor | Local | Flags | Link |")
    out.append("|---|---|---|---|---|---|---|---|---|---|---|---|")
    for i, it in enumerate(aprovados, 1):
        flags = "; ".join(it.get("_flags") or []) or "-"
        out.append("| {} | R$ {} | {} | {} | {} | {} | {} | {} | {} | {} | {} | [link]({}) |".format(
            i, fmt(it.get("preco_brl")), fmt(it.get("preco_pix_brl")),
            fmt(it.get("titulo")), fmt(it.get("chip")), fmt(it.get("ram_gb")),
            fmt(it.get("ssd_gb")), fmt(it.get("estado")), fmt(it.get("vendedor")),
            fmt(it.get("localizacao")), flags, it.get("url", "")))

    out.append("\n## RAM nao confirmada (cheque manual)\n")
    for it in ram_nao_conf:
        out.append(f"- {fmt(it.get('titulo'))} — {it.get('url','')}")

    open("resultado.md", "w").write("\n".join(out))
    print("\n".join(out))
    print("\n[ok] salvo em resultado.md", file=sys.stderr)


if __name__ == "__main__":
    main()
