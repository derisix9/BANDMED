# BandMed — Sistema Integrado de Gestão Escolar (EduGest)

Bem-vindo ao **BandMed**, uma plataforma de gestão escolar moderna, completa e pronta para produção, desenvolvida com **HTML5, CSS3, JavaScript, Bootstrap 5 e React** no frontend, com suporte a **Firebase Realtime / Firestore** e exportação autónoma para **MySQL**.

Este manual foi escrito passo a passo de forma simples e clara para quem **não é programador**.

---

## 🎨 Identidade Visual & Design System

- **Cor Principal:** Azul Escuro Institucional (`#0B1F3A`)
- **Cor Secundária / Destaque:** Vermelho Escuro (`#7A0C0C`)
- **Tipografia:** Google Fonts Plus Jakarta Sans (Texto corrente) e Syne (Títulos executivos)
- **Componentes:** Bootstrap 5 (Navbar, Sidebar, Cards, Tabelas, Modais, Formulários, Badges, Alertas)
- **Moeda Padrão:** Kwanza Angolano (**Kz**)

---

## 👥 Perfis de Acesso & Credenciais de Teste

O sistema disponibiliza 4 perfis de utilizador com diferentes níveis de permissão. Pode alternar entre eles a qualquer momento através do botão **"Alternar Perfil"** no topo da barra de navegação ou através do ecrã de início de sessão.

A palavra-passe padrão para todas as contas de teste é: `EduGest2024!`

| Perfil | Nome Demonstrativo | E-mail de Acesso | Palavra-passe | Permissões Principais |
| :--- | :--- | :--- | :--- | :--- |
| **Administrador** | Dr. Carlos Mendes | `admin@escola.pt` | `EduGest2024!` | Acesso total: Alunos, Professores, Turmas, Pautas, Tesouraria, Relatórios e Configurações |
| **Professor** | Prof.ª Marta Fontes | `prof.marta@escola.pt` | `EduGest2024!` | Lançamento de presenças na caderneta diária, sumários de aula, notas e pautas |
| **Aluno** | Tiago André Silva | `aluno.tiago@escola.pt` | `EduGest2024!` | Consulta de notas (boletim), faltas, horário de aulas e avisos do colégio |
| **Encarregado** | Dr. Miguel Ferreira Silva | `encarregado.silva@escola.pt` | `EduGest2024!` | Acompanhamento do educando, boletim escolar, assiduidade e pagamento de propinas |

---

## 🚀 Como Executar o Projeto (Guia Rápido para Não Programadores)

### Pré-requisitos
Apenas precisa de ter o **Node.js** (versão 18 ou superior) instalado no seu computador.
Pode descarregá-lo gratuitamente em [nodejs.org](https://nodejs.org/).

### Passo 1: Instalar Dependências
Abra o seu terminal (ou Linha de Comandos no Windows) na pasta do projeto e execute:
```bash
npm install
```

### Passo 2: Configurar o Ficheiro de Variáveis (.env)
Copie o ficheiro de exemplo `.env.example` para `.env`:
```bash
cp .env.example .env
```
*(Se não quiser ligar ao Firebase de imediato, não precisa de alterar nada no ficheiro `.env` — a aplicação funciona imediatamente em modo offline com armazenamento local automático no navegador).*

### Passo 3: Iniciar a Aplicação
Execute o seguinte comando no terminal:
```bash
npm run dev
```
O sistema arrancará no endereço:
👉 **`http://localhost:3000`** (ou porta indicada no terminal). Abra esse link no seu navegador de internet (Google Chrome, Firefox, Edge, Safari).

---

## 🗄️ Base de Dados MySQL (.sql) e phpMyAdmin

Se desejar utilizar uma base de dados relacional **MySQL** ou **MariaDB** (por exemplo com o **XAMPP**, **WampServer**, **Laragon**, **cPanel** ou **MySQL Workbench**):

1. Foi gerado um ficheiro autónomo completo localizado em:
   📁 **`database/gestao_escolar.sql`**
2. No próprio sistema web, basta clicar no botão **"Download .SQL"** na barra superior para descarregar o ficheiro com 1 clique.
3. Abra o **phpMyAdmin**:
   - Crie uma nova base de dados chamada `gestao_escolar` (com codificação `utf8mb4_unicode_ci`).
   - Clique no menu superior **"Importar"**.
   - Selecione o ficheiro `database/gestao_escolar.sql`.
   - Clique em **"Executar"**.
4. Todas as 14 tabelas normalizadas (`users`, `students`, `teachers`, `classes`, `attendance_sheets`, `exams`, `tuition_fees`, etc.) e os dados de teste serão criados e preenchidos instantaneamente!

---

## 📦 Módulos do Sistema Implementados

1. **Dashboard Principal:** Indicadores em tempo real, gráfico SVG de assiduidade por ciclo, execução orçamental de propinas, mural de avisos e agenda de eventos.
2. **Alunos & Matrículas:** Listagem oficial, pesquisa avançada por turma e estado financeiro, emissão de boletins, ficha do aluno e modal de nova matrícula.
3. **Boletim de Notas Oficial:** Certificado timbrado com cálculo ponderado (MAC 30%, NPP 30%, NPT 40%), apreciação qualitativa, carimbo notarial e impressão/PDF.
4. **Professores:** Registo com número de agente, habilitações, alocação de carga horária e contacto telefónico.
5. **Turmas & Horários:** Lotação de salas, turnos, diretores de turma e grelha semanal de aulas (Segunda a Sexta).
6. **Assiduidade Diária:** Caderneta oficial com botões rápidos (P - Presente, FJ - Justificada, FI - Injustificada, A - Atraso), sumário de aula e rubrica digital docente.
7. **Exames & Pautas:** Lançamento de notas com recálculo automático instantâneo da Média Trimestral (MT) e homologação pelo conselho pedagógico.
8. **Propinas & Tesouraria:** Facturas e recibos em Kwanzas (**Kz**), controlo de mora, cálculo de juros e referências Multicaixa Express (Entidade `00192`).
9. **Mural de Comunicados & Biblioteca:** Publicação de circulares com diferentes níveis de urgência e catálogo de obras bibliográficas.
10. **Relatórios Oficiais:** Mapas trimestrais de aproveitamento, balancete financeiro e mapas estatísticos com exportação CSV/Excel.
11. **Configurações:** Dados da instituição, Alvará do MED Angola, alteração do ano letivo e restauro de dados de fábrica.

---

## 🔒 Segurança e Dados Locais

- **Persistência Reativa:** Todas as alterações feitas no ecrã (novas matrículas, faltas marcadas, notas alteradas, pagamentos efetuados) são guardadas imediatamente.
- **Restauração Rápida:** No menu de configurações ou no seletor de perfis, existe o botão **"Restaurar Dados de Fábrica"** para retornar ao conjunto demonstrativo sempre que necessário.
