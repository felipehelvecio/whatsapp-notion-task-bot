# NotionZapBot

Gerencie tarefas do Notion diretamente pelo WhatsApp.

O bot permite criar, atualizar, deletar e acompanhar tarefas usando mensagens no WhatsApp, além de enviar lembretes automáticos e relatórios diários.

---

# Funcionalidades

Criar tarefas pelo WhatsApp; Atualizar status de tarefas; Deletar tarefas; Relatório diário; Relatório mensal; Lembretes automáticos; Integração com Notion API; IDs automáticos; Detecção automática de datas

---

# Exemplos de comandos

## Criar tarefa

```text id="0nt7y6"
Configurar o computador do Fernando amanhã
```
<img width="1045" height="221" alt="image" src="https://github.com/user-attachments/assets/d85c1f64-a66f-494a-bc01-4e0a931fc886" />      <img width="232" height="353" alt="image" src="https://github.com/user-attachments/assets/65003ba0-fb0e-4e41-b6c6-c4bbaeadb52f" />   <img width="384" height="281" alt="image" src="https://github.com/user-attachments/assets/2d474c26-8140-4cf0-80e4-3932973521fc" />
<img width="1363" height="908" alt="image" src="https://github.com/user-attachments/assets/74d47650-d0a5-4acb-aa61-127b718bc3b8" />




---

## Atualizar status

```text id="0upn5n"
118 concluido
```
<img width="224" height="164" alt="image" src="https://github.com/user-attachments/assets/3fb2c2e2-9179-433a-8346-d79f403506d5" />  <img width="363" height="271" alt="image" src="https://github.com/user-attachments/assets/f27da73a-08c0-4c2b-b7c4-4de35b82e5c5" />   <img width="1238" height="914" alt="image" src="https://github.com/user-attachments/assets/162c2da5-42da-44c8-8061-feccd91ea3f9" />




```text id="o89wbm"
118 andamento
```

---

## Deletar tarefa

```text id="r9kw7m"
deletar 118
```
<img width="373" height="150" alt="image" src="https://github.com/user-attachments/assets/a2ff4a94-60a0-434f-92c0-e408e3cbcd41" />  <img width="394" height="154" alt="image" src="https://github.com/user-attachments/assets/89896a6c-5436-4d3e-bd22-53691b802c0e" />  <img width="271" height="369" alt="image" src="https://github.com/user-attachments/assets/49df49c0-ecbd-4faf-a551-008613c2d4a8" />




---

## Relatórios

```text id="0c5r6m"
relatorio dia
```
<img width="327" height="331" alt="image" src="https://github.com/user-attachments/assets/20d550aa-cd06-4f37-aff7-d98fe321792c" />  <img width="452" height="424" alt="image" src="https://github.com/user-attachments/assets/9de41559-60fd-40db-bfe5-f439eb9cfd9f" />




```text id="y8x9wq"
relatorio mes
```
<img width="543" height="583" alt="image" src="https://github.com/user-attachments/assets/d9219df7-4d83-44c8-9f89-f4c17fe3564b" />  <img width="735" height="542" alt="image" src="https://github.com/user-attachments/assets/fdeebb69-8b67-4d44-ba98-6da37f3a67d2" />




---

# Tecnologias utilizadas

* Node.js
* whatsapp-web.js
* Notion API
* chrono-node
* node-cron

---

# Instalação

Clone o projeto:

```bash id="ylv5xg"
git clone https://github.com/SEU-USUARIO/NotionZapBot.git
```

Entre na pasta:

```bash id="o0qqtm"
cd NotionZapBot
```

Instale as dependências:

```bash id="t7h84w"
npm install
```

---

# Configuração

Crie um arquivo `.env`

```env id="m0e7pn"
NOTION_TOKEN=SEU_TOKEN
DATABASE_ID=SEU_DATABASE_ID
```

---

# Executar o projeto

```bash id="2l4jlwm"
node index.js
```

---

# Estrutura do banco no Notion

O banco de dados deve conter:

| Campo          | Tipo   |
| -------------- | ------ |
| Nome da tarefa | Title  |
| Status         | Select |
| Prazo          | Date   |
| ID             | Number |

<img width="1116" height="86" alt="image" src="https://github.com/user-attachments/assets/e0057566-b8b8-40f9-a53f-f201960c820b" />


---

# Automação

O bot envia automaticamente:

* 📋 Lembretes às 08:00
* 📋 Lembretes às 13:00
* 📊 Relatório final às 16:55

---

# Preview

<img width="1916" height="993" alt="image" src="https://github.com/user-attachments/assets/4307a8d7-6c0c-41a6-bd3c-c16274b2a540" />


---

# Licença

MIT License
