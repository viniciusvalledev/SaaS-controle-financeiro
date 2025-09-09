# Your Money, Your life

![Status do Projeto](https://img.shields.io/badge/status-concluído-brightgreen)
![Licença](https://img.shields.io/badge/licença-MIT-blue)

Uma aplicação web moderna e responsiva para análise e controle financeiro pessoal, construída com JavaScript puro e integrada com os serviços do Firebase. Permite que os usuários gerenciem suas receitas e despesas de forma intuitiva, com dashboards visuais e detalhados.

---

## ✨ Funcionalidades Principais

* **Autenticação Segura:** Sistema completo de Login, Cadastro, Recuperação de Senha e opção de "Ver Senha".
* **Persistência de Dados na Nuvem:** Todas as transações são salvas de forma segura na conta de cada usuário usando o Firestore, permitindo acesso de múltiplos dispositivos (celular, computador, etc.).
* **Sidebar Navegável:** Um menu lateral profissional e expansível para navegar entre as diferentes seções da aplicação.
* **Dashboard Completo:** Visão geral das finanças com saldo, histórico de transações e formulário para novos lançamentos.
* **Análise por Período:** Alterne facilmente entre a visão **Mensal** e **Anual** dos seus dados em todos os dashboards.
* **Dashboards de Categoria:** Telas dedicadas para cada categoria de receita e despesa, com gráficos e históricos específicos.
* **Gráficos Interativos:** Visualize seus dados com múltiplos tipos de gráficos, incluindo Colunas, Barras, Linha e Pizza.
* **Design Responsivo:** Interface totalmente adaptável para uma experiência perfeita tanto em desktops quanto em dispositivos móveis.
* **Interface Moderna:** Design limpo e intuitivo com modais personalizados para confirmações e interações, evitando o uso de alertas padrão do navegador.

## 🚀 Tecnologias Utilizadas

* **Frontend:** HTML5, CSS3, JavaScript (ES6 Modules)
* **Backend & Banco de Dados:** Google Firebase
    * **Firebase Authentication:** Para gerenciamento de usuários.
    * **Firestore Database:** Para armazenamento de dados em tempo real.
    * **Firebase Hosting:** Para publicação e hospedagem do projeto.
* **Gráficos:** [Chart.js](https://www.chartjs.org/)
* **Ícones:** [Font Awesome](https://fontawesome.com/)

## 🏁 Como Começar

Para rodar este projeto localmente, siga os passos abaixo.

### Pré-requisitos

* Você precisa ter o [Node.js](https://nodejs.org/) instalado para usar o `npm`.
* Você precisa ter o [Firebase Tools](https://firebase.google.com/docs/cli) instalado globalmente:
    ```bash
    npm install -g firebase-tools
    ```

### Instalação e Configuração

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)
    cd seu-repositorio
    ```

2.  **Crie e configure seu projeto no Firebase:**
    * Crie um novo projeto no Console do Firebase.
    * Ative os serviços de **Authentication** (com o provedor "Email/Senha") e **Firestore Database**.
    * Ao criar o Firestore, inicie no **Modo de Produção** e escolha a localização mais próxima (ex: `southamerica-east1`).
    * Na aba **Regras** do Firestore, cole as regras de segurança para permitir que apenas usuários logados acessem seus próprios dados.
    * Copie o objeto de configuração `firebaseConfig` das "Configurações do Projeto" e cole no topo do arquivo `main.js`.

3.  **Crie os Índices do Firestore:**
    * Rode a aplicação localmente.
    * Abra o **Console** do navegador (F12).
    * Navegue pelos dashboards. O console mostrará erros com links para a criação automática dos **índices** necessários. Clique nesses links e crie os índices no Firebase.

4.  **Rode o projeto localmente:**
    * A maneira mais simples é usar uma extensão do VS Code como a **"Live Server"**. Clique com o botão direito no seu arquivo `index.html` e selecione "Open with Live Server".

5.  **Para publicar o projeto:**
    ```bash
    firebase deploy
    ```

## 📂 Estrutura do Projeto


/
├── public/
│   ├── index.html      # Estrutura principal da página
│   ├── style.css       # Folha de estilos principal
│   └── main.js         # Lógica principal da aplicação
├── firestore.rules     # Regras de segurança do banco de dados
├── firestore.indexes.json # Definições de índices do banco de dados
├── firebase.json       # Configurações do projeto Firebase
└── README.md           # Este arquivo


## 📜 Licença

Distribuído sob a Licença MIT.
