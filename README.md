Veridit

Plataforma de autenticação de provas digitais para advogados.

Sistema que permite a captura de conteúdo na web (páginas, conversas, publicações) com geração imediata de uma trilha de integridade criptográfica, produzindo registros confiáveis o suficiente para uso como prova jurídica.

Contexto acadêmico
Este projeto foi desenvolvido para a disciplina Engenharia de Software I, ministrada pelo Prof. Dr. Eduardo Almeida, no curso de Sistemas de Informação da Universidade Federal da Bahia (UFBA).
Esta entrega corresponde ao Trabalho III, cujo objetivo é implementar 30% dos requisitos definidos no documento de arquitetura previamente elaborado pela equipe, demonstrando o sistema em funcionamento, o uso de princípios SOLID e a aderência (ou desvios documentados via ADRs) à arquitetura proposta.
A lista dos requisitos implementados nesta sprint está em docs/requisitos-sprint.md, e eventuais desvios arquiteturais estão registrados em docs/adrs/.

Problema
Provas digitais (prints de conversas, publicações em redes sociais, páginas web) são facilmente contestadas em juízo por serem trivialmente forjáveis. O Veridit resolve isso capturando o conteúdo de forma automatizada e aplicando, no momento da captura, um hash SHA-256 sobre o artefato gerado, armazenando o registro em uma trilha de auditoria append-only — ou seja, registros que não podem ser alterados nem apagados após a criação.

Arquitetura
O sistema segue uma arquitetura de microsserviços com um API Gateway como ponto único de entrada. O frontend nunca acessa o serviço de captura ou o banco diretamente — toda comunicação passa pelo Gateway, que centraliza autenticação (JWT) e controle de acesso por papéis (RBAC).