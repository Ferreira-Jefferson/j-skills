#!/usr/bin/env python3
"""Checagem de integridade da base de erros do projeto.

Rode DEPOIS de todo save e sempre que um lookup devolver algo estranho:
    python <skill-dir>/scripts/integrity.py            # checa a base
    python <skill-dir>/scripts/integrity.py --next-id  # imprime o proximo ERR-NNN livre

A base fica em <projeto>/.claude/memory/errors/. O projeto e --root, senao
$CLAUDE_PROJECT_DIR, senao o diretorio atual.

A base apodrece em silencio: ID duplicado, linha de indice sem entrada, entrada sem
linha de indice, entrada sem Status, segredo colado num comando. Quando isso acontece o
lookup devolve uma solucao morta (ou vaza uma credencial) - exatamente o que esta skill
existe pra evitar.

Sai com codigo 1 se achar qualquer problema.
"""
from __future__ import annotations

import argparse
import collections
import os
import re
import sys
from pathlib import Path

ROW = re.compile(r"^\|\s*(ERR-\d+)\s*\|([^|]*)\|\s*([^|]+?)\s*\|", re.M)
# Dois formatos historicos de heading: "## [ERR-001] x" e "## ERR-005 — x".
ENTRY = re.compile(r"^##\s*\[?(ERR-\d+)\]?\s*[—\-:]?\s*(.+)$", re.M)
FIELD = re.compile(r"^\|\s*\*\*(.+?)\*\*\s*\|\s*(.*?)\s*\|$", re.M)
STATUS_PROSA = re.compile(r"\*\*Status:?\*\*", re.I)
# Formatos de credencial que nunca podem estar na base (o arquivo e lido por todo agente).
SECRET = re.compile(
    r"(sk-[A-Za-z0-9_-]{20,}|sbp_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{30,}"
    r"|gh[pousr]_[A-Za-z0-9]{30,}|xox[abpr]-[A-Za-z0-9-]{10,}|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}"
    r"|-----BEGIN [A-Z ]*PRIVATE KEY-----)"
)


def base_dir(root: str | None) -> Path:
    project = Path(root or os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd())
    return project.resolve() / ".claude" / "memory" / "errors"


def load(base: Path):
    index_rows, entries, dup_ids = {}, {}, []
    for err_id, keywords, category in ROW.findall((base / "INDEX.md").read_text(encoding="utf-8")):
        if err_id in index_rows:
            dup_ids.append(err_id)
        index_rows[err_id] = (keywords.strip(), category.strip())

    secrets = []
    for path in sorted(base.glob("*.md")):
        body = path.read_text(encoding="utf-8")
        if SECRET.search(body):
            secrets.append(path.name)
        if path.name == "INDEX.md":
            continue
        for match in ENTRY.finditer(body):
            nxt = ENTRY.search(body, match.end())
            chunk = body[match.end() : nxt.start() if nxt else len(body)]
            entries.setdefault(match.group(1), []).append((path.name, match.group(2), chunk))
    return index_rows, entries, dup_ids, secrets


def next_id(index_rows, entries) -> str:
    nums = [int(i.split("-")[1]) for i in set(index_rows) | set(entries)]
    return "ERR-{:03d}".format(max(nums, default=0) + 1)


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description="Integridade da base de erros (.claude/memory/errors).")
    p.add_argument("--root", help="raiz do projeto (default: $CLAUDE_PROJECT_DIR ou cwd)")
    p.add_argument("--next-id", action="store_true", help="imprime o proximo ID livre e sai")
    args = p.parse_args(argv)

    base = base_dir(args.root)
    if not (base / "INDEX.md").exists():
        print("INDEX.md nao encontrado em {} - base ainda nao criada".format(base))
        return 1

    index_rows, entries, dup_index, secrets = load(base)
    if args.next_id:
        print(next_id(index_rows, entries))
        return 0

    problems = []
    if dup_index:
        problems.append(("ID duplicado no INDEX", sorted(set(dup_index)),
                         "Dois erros dividindo o mesmo ID: o lookup devolve o errado. "
                         "Renumere o mais novo com --next-id."))
    dup_entry = sorted(i for i, v in entries.items() if len(v) > 1)
    if dup_entry:
        problems.append(("Entrada duplicada nos arquivos", dup_entry,
                         "Mesmo ID definido 2x. Funda numa entrada so - solucao antiga vira "
                         "historico marcado OBSOLETA, nunca uma segunda entrada."))
    orfas = sorted(set(index_rows) - set(entries))
    if orfas:
        problems.append(("Linha de indice sem entrada", orfas,
                         "O indice promete uma solucao que nao existe. Escreva a entrada ou remova a linha."))
    invisiveis = sorted(set(entries) - set(index_rows))
    if invisiveis:
        problems.append(("Entrada sem linha de indice", invisiveis,
                         "A solucao existe mas o lookup nunca acha. Adicione a linha no INDEX."))
    sem_status = sorted({
        err_id for err_id, occ in entries.items() for _, _, chunk in occ
        if not (any(k.lower().startswith("status") for k in dict(FIELD.findall(chunk)))
                or STATUS_PROSA.search(chunk))
    })
    if sem_status:
        problems.append(("Entrada sem campo Status", sem_status,
                         "Sem 'Status: ATIVA (verificada em AAAA-MM-DD)' nao da pra saber se a "
                         "solucao ainda vale. Toda entrada precisa do campo."))
    if secrets:
        problems.append(("Credencial na base", secrets,
                         "Token/chave colado num comando. Troque pelo nome da variavel "
                         "(ex.: $SUPABASE_ACCESS_TOKEN) e considere a chave vazada."))

    print("Base de erros: {} entradas, {} linhas de indice (proximo: {})".format(
        len(entries), len(index_rows), next_id(index_rows, entries)))
    counts = collections.Counter(occ[0][0] for occ in entries.values())
    for name, n in sorted(counts.items()):
        print("   {:<16} {}".format(name, n))

    if not problems:
        print("\nOK - nenhum problema de integridade.")
        return 0
    print("\n{} problema(s):".format(len(problems)))
    for title, items, fix in problems:
        print("\n  [{}] {}".format(title, ", ".join(items)))
        print("      -> {}".format(fix))
    return 1


if __name__ == "__main__":
    sys.exit(main())
