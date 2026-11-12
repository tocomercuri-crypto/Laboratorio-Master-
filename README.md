# Laboratório Diesel - Sistema de Gestão

Sistema web completo para gestão de laboratório diesel com integração ao Google Sheets.

## Funcionalidades

- **Cadastro de Clientes** — Nome, telefone, CPF/CNPJ, cidade, veículo e placa
- **Ordens de Serviço** — Controle completo com numeração, status e valores
- **Controle de Estoque** — Peças com código, categoria, quantidade mínima e preços
- **Controle de Vendas** — Registro com itens, baixa automática no estoque
- **Painel (Dashboard)** — Visão geral com estatísticas e faturamento

## Tecnologias

- HTML/CSS/JavaScript (arquivo único, sem dependências)
- Google Sheets como banco de dados (via Apps Script)
- Cache local com localStorage

## Como usar

### 1. Criar a planilha

A planilha do Google Sheets deve conter 5 abas com os seguintes cabeçalhos:

| Aba | Colunas |
|-----|---------|
| Clientes | ID, Nome, Telefone, CPF_CNPJ, Cidade, Estado, Veiculo, Placa |
| Ordens | ID, Num, Data, ClienteID, Servico, Descricao, Status, Valor |
| Estoque | ID, Codigo, Descricao, Categoria, Quantidade, QtdMinima, Custo, PrecoVenda |
| Vendas | ID, Num, Data, ClienteID, Total |
| ItensVenda | VendaID, ItemID, Codigo, Descricao, Qtd, Subtotal |

### 2. Configurar o Apps Script

1. Na planilha, vá em **Extensões > Apps Script**
2. Cole o conteúdo do arquivo `AppsScript.gs`
3. Clique em **Implantar > Nova implantação**
4. Selecione **App da Web**
5. Em "Quem tem acesso", selecione **Qualquer pessoa**
6. Clique em **Implantar** e copie a URL gerada

### 3. Conectar o sistema

1. Abra o `index.html` no navegador
2. Cole a URL do Apps Script na barra de configuração no topo
3. Clique em **Salvar** e depois **Testar**
4. O status deve mudar para "Conectado"

## Funciona offline

O sistema funciona mesmo sem a API configurada, usando cache local (localStorage). Os dados são sincronizados automaticamente quando a conexão é estabelecida.
