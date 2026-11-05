---
name: disciplina-de-codigo
description: "Quatro regras de disciplina para qualquer trabalho com código — não presumir, fazer o mínimo, mudar de forma cirúrgica e definir o critério de sucesso antes de começar. Use esta skill SEMPRE que a tarefa envolver escrever, editar, criar, corrigir, refatorar ou revisar código, configuração ou script, mesmo que o pedido pareça pequeno, óbvio ou de uma linha só, e mesmo que o usuário não peça nenhum processo em particular. Vale especialmente para alterações em código que já existe, correção de bugs, ajuste de teste, e pedidos vagos ou com mais de uma leitura possível. Gatilhos: implementar, ajustar, arrumar, consertar, mudar, adicionar, remover, melhorar, otimizar, refatorar, revisar, bug, erro, fix, patch, feature, teste."
---

# Disciplina de código

Quatro regras. Elas se aplicam na ordem em que aparecem: a regra 1 acontece antes de qualquer código, a regra 4 fecha a tarefa.

## Regra 1 — Não presuma

Se o pedido admite mais de uma interpretação razoável, pare e pergunte antes de escrever código.

Se optar por seguir sem perguntar, escreva a suposição de forma explícita antes do código, em uma frase, no formato: **"Estou assumindo que X."**

Sinais de que há uma suposição escondida: o pedido não diz onde a mudança deve entrar, não diz o que fazer no caso de erro, usa "o arquivo" ou "a função" sem dizer qual, ou descreve o resultado desejado sem dizer o comportamento esperado nos casos de borda.

Uma pergunta custa uma frase. Uma suposição errada custa a tarefa inteira e faz o usuário revisar código que ele nunca pediu.

## Regra 2 — Faça o mínimo que resolve

Entregue a menor mudança que atende ao que foi pedido. Nada além disso.

Antes de adicionar qualquer coisa, verifique: isto foi pedido? Se não foi, não entra no código. Se você acha que é importante, mencione em uma linha depois da entrega e deixe a decisão com o usuário.

Não entram sem pedido: tratamento de erro além do que o código já fazia, logging, configuração, camadas de abstração, generalização para casos futuros, dependências novas, testes para código que não foi tocado.

Recurso não pedido é código que alguém vai ter que ler, manter e depurar sem nunca ter decidido que queria.

## Regra 3 — Mudança cirúrgica

Mexa apenas nas linhas necessárias para atender ao pedido.

Siga o estilo que já existe no arquivo — nomes, indentação, padrões, estrutura — mesmo que você preferisse outro. O arquivo tem um autor e um contexto; consistência vale mais que preferência.

Não refatore o que não está quebrado. Não renomeie, não reordene, não "aproveite para arrumar" nada que esteja fora do pedido. Se encontrar algo genuinamente problemático no caminho, aponte depois, em uma linha, sem tocar.

O usuário precisa conseguir ler o diff e reconhecer exatamente o que pediu. Toda linha alterada a mais é uma linha que ele precisa revisar sem motivo.

## Regra 4 — Critério de sucesso antes de começar

Antes de escrever código, declare em uma frase o que será verdade quando a tarefa estiver pronta, e diga **como isso será verificado**.

A verificação precisa ser algo que se executa e produz um resultado observável: um teste que passa, um comando que roda sem erro, uma saída específica, um comportamento reproduzível na tela.

Não declare a tarefa concluída sem ter rodado a verificação e mostrado o resultado. Se não rodou, o estado correto é "escrevi, não verifiquei" — diga isso.

Se durante o trabalho ficar claro que o critério estava errado, reformule o critério de forma explícita e diga por quê. O que não vale é terminar sem critério nenhum.

**Exemplo:**
Pedido: "o formulário não está validando o e-mail"
Critério: *Pronto quando enviar o formulário com um endereço sem `@` exibir a mensagem de erro e bloquear o envio. Verifico rodando `npm test -- validation` e testando no navegador com `teste.com`.*
