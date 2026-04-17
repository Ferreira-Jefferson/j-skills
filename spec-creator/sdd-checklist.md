# SDD Quality Checklist

> **Quando usar:** Este checklist é para **validação pós-fase**. Rode depois de completar cada fase para verificar se nada foi esquecido. Os arquivos de fase guiam a escrita; este checklist valida o resultado.

## Checklist por Fase

### ✅ FASE 0 — Entrevista
- [ ] Stack tecnológica confirmada
- [ ] Usuários-alvo identificados
- [ ] Integrações externas listadas
- [ ] Restrições documentadas
- [ ] Critério de sucesso definido
- [ ] Escopo negativo (o que NÃO fazer) definido

### ✅ FASE 1 — SPEC
- [ ] Problema claramente articulado
- [ ] Solução em alto nível descrita
- [ ] Valor de negócio justificado
- [ ] Riscos identificados com mitigação
- [ ] Glossário de termos do domínio

### ✅ FASE 2 — REQUIREMENTS
- [ ] Toda user story tem pelo menos 3 critérios de aceitação
- [ ] Critérios de aceitação são VERIFICÁVEIS (não ambíguos)
- [ ] Requisitos não-funcionais têm MÉTRICAS concretas
- [ ] Fluxos de erro mapeados
- [ ] Regras de negócio explícitas
- [ ] Matriz de rastreabilidade preenchida

### ✅ FASE 3 — DESIGN
- [ ] Diagrama de componentes presente
- [ ] Modelo de dados normalizado
- [ ] API contract completo (request + response + erros)
- [ ] Estratégia de segurança documentada
- [ ] Autenticação e autorização definidas (mecanismo + roles)
- [ ] Validação de entrada especificada (server-side obrigatório)
- [ ] Dados sensíveis / PII identificados e tratamento definido
- [ ] Rate limiting especificado por endpoint
- [ ] OWASP Top 10 revisado — riscos aplicáveis mapeados
- [ ] Auditoria de dependências prevista no CI
- [ ] Plano de cache/performance definido
- [ ] Pelo menos 1 ADR por decisão não-óbvia
- [ ] Tratamento de erros especificado

### ✅ FASE 4 — TEST PLAN
- [ ] Todo AC coberto por pelo menos 1 teste
- [ ] Pirâmide de testes respeitada (60/30/10)
- [ ] Ferramentas de teste definidas
- [ ] Dados de teste especificados
- [ ] Critérios de performance testáveis
- [ ] Testes SEC gerados APENAS para riscos marcados como Aplicável no DESIGN § 6
- [ ] Nenhum teste SEC criado para risco declarado Não aplicável no DESIGN
- [ ] Meta de cobertura definida (≥80%)

### ✅ FASE 5 — TASKS
- [ ] Toda task tem critério de conclusão verificável
- [ ] Dependências entre tasks explícitas
- [ ] Cada task inclui os testes associados
- [ ] Estimativas presentes
- [ ] Ordem respeita dependências técnicas
- [ ] Task de documentação incluída
- [ ] Task de review final incluída

### ✅ FASE 6 — Implementação
- [ ] Nenhuma task avança sem aprovação
- [ ] Testes escritos junto com código (TDD preferencial)
- [ ] Cada critério de conclusão verificado antes de marcar como done
- [ ] ADRs criados para decisões tomadas durante implementação

### ✅ FASE 7 — Review Final
- [ ] 100% dos RFs implementados
- [ ] 100% dos RNFs dentro do SLA
- [ ] Cobertura ≥ 80%
- [ ] Zero testes falhando
- [ ] Documentação atualizada
- [ ] Dívidas técnicas documentadas
