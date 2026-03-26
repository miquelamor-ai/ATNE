# ATNE — Adaptador de Textos a Necessitats Educatives

Assistent IA per adaptar textos educatius a les necessitats de l'alumnat.

## Stack v1 (MVP)

- **Backend**: PHP 8.2 + Slim4
- **Frontend**: HTML + JavaScript + CSS (sense frameworks)
- **LLM**: OpenAI gpt-4.1-mini (Responses API)
- **Base de dades**: MS SQL Server
- **Desplegament**: Azure Web App

## Documentació

- [SPEC_MVP_v1.md](SPEC_MVP_v1.md) — Especificació tècnica v1 (sense RAG)
- [SPEC_MVP_AZURE.md](SPEC_MVP_AZURE.md) — Especificació v2 (amb RAG + OpenAI Vector Stores)
- [corpus/](corpus/) — Documents pedagògics de referència
