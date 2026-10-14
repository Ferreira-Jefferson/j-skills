#!/usr/bin/env python3
"""Hook PostToolUseFailure da skill error-memory.

Conta as falhas de shell por operacao, dentro da sessao, e so lembra o Claude de
consultar a base a partir da 2a falha da MESMA operacao. A 1a falha passa em silencio:
grep sem match, diff com diferenca e checagens que saem 1 por design nao viram ruido.

Configuracao (settings.json do usuario, vale para todos os projetos):
    "PostToolUseFailure": [{"matcher": "Bash|PowerShell", "hooks": [{"type": "command",
        "command": "python \"<skill-dir>/scripts/failure_hook.py\"", "timeout": 5}]}]

Nunca falha: qualquer erro interno sai 0 sem saida, para nao atrapalhar a sessao.
"""
from __future__ import annotations

import json
import os
import re
import shlex
import sys
import tempfile

THRESHOLD = 2
# Comandos cujo exit != 0 e resposta, nao falha (sem match, ha diferenca, teste falso).
ANSWER_COMMANDS = {"grep", "rg", "egrep", "fgrep", "diff", "cmp", "test", "[", "[[", "find", "ls"}
ANSWER_GIT = {"check-ignore", "diff", "grep", "merge-base", "ls-files", "rev-parse", "show-ref"}
PREFIXES = {"sudo", "time", "env", "exec", "command", "npx", "uvx", "pnpm", "yarn", "bunx", "&", "."}


def operation_key(command: str) -> str | None:
    """Reduz o comando a 'programa subcomando' do ultimo trecho que roda de fato."""
    # O que falha costuma ser o ultimo comando encadeado; 'cd x &&' e ruido.
    segments = [s for s in re.split(r"&&|\|\||;|\n", command) if s.strip()]
    for seg in reversed(segments):
        seg = seg.split("|")[0]
        try:
            tokens = shlex.split(seg, posix=True)
        except ValueError:
            tokens = seg.split()
        tokens = [t for t in tokens if not re.match(r"^[A-Za-z_][A-Za-z0-9_]*=", t)]
        while tokens and tokens[0] in PREFIXES:
            tokens = tokens[1:]
        if not tokens or tokens[0] == "cd":
            continue
        prog = os.path.basename(tokens[0]).lower()
        prog = re.sub(r"\.(exe|cmd|bat|ps1)$", "", prog)
        sub = next((t for t in tokens[1:] if not t.startswith("-")), "")
        if prog in ANSWER_COMMANDS or (prog == "git" and sub in ANSWER_GIT):
            return None
        if re.search(r"[./\\]", sub):  # script ou arquivo: o nome distingue a operacao
            sub = re.split(r"[/\\]", sub)[-1]
        return "{} {}".format(prog, sub).strip() if re.match(r"^[\w][\w.:-]*$", sub or "") else prog
    return None


def main() -> int:
    data = json.load(sys.stdin)
    if data.get("is_interrupt"):
        return 0
    command = (data.get("tool_input") or {}).get("command") or ""
    key = operation_key(command)
    if not key:
        return 0

    session = re.sub(r"[^\w-]", "_", data.get("session_id") or "nosession")
    state_dir = os.path.join(tempfile.gettempdir(), "claude-error-memory")
    os.makedirs(state_dir, exist_ok=True)
    path = os.path.join(state_dir, session + ".json")
    try:
        with open(path, encoding="utf-8") as f:
            counts = json.load(f)
    except (OSError, ValueError):
        counts = {}
    counts[key] = counts.get(key, 0) + 1
    with open(path, "w", encoding="utf-8") as f:
        json.dump(counts, f)

    n = counts[key]
    if n < THRESHOLD:
        return 0
    msg = (
        "[error-memory] `{key}` falhou {n}x nesta sessao. ANTES da proxima tentativa: "
        "Skill(error-memory, \"lookup <keywords do erro>\"). Se a base indicar uma solucao "
        "e ela falhar, rode o workflow FAIL (marcar OBSOLETA) antes de tentar outra coisa."
    ).format(key=key, n=n)
    print(json.dumps({"hookSpecificOutput": {"hookEventName": "PostToolUseFailure",
                                             "additionalContext": msg}}))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:
        sys.exit(0)
