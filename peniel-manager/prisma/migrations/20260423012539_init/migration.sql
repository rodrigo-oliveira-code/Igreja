-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'LIDER', 'MEMBRO');

-- CreateEnum
CREATE TYPE "StatusMembro" AS ENUM ('ATIVO', 'INATIVO', 'VISITANTE', 'TRANSFERIDO');

-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('CULTO', 'ENSAIO', 'REUNIAO', 'CELULA', 'CONFERENCIA', 'OUTRO');

-- CreateEnum
CREATE TYPE "TipoLancamento" AS ENUM ('ENTRADA', 'SAIDA');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "nome" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MEMBRO',
    "membroId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membro" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "dataNascimento" TIMESTAMP(3),
    "dataIngresso" TIMESTAMP(3),
    "status" "StatusMembro" NOT NULL DEFAULT 'ATIVO',
    "foto" TEXT,
    "endereco" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Membro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Departamento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "cor" TEXT NOT NULL DEFAULT '#7C3AED',
    "liderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Departamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembroDepto" (
    "id" TEXT NOT NULL,
    "membroId" TEXT NOT NULL,
    "departamentoId" TEXT NOT NULL,
    "funcao" TEXT,

    CONSTRAINT "MembroDepto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "horaInicio" TEXT,
    "horaFim" TEXT,
    "tipo" "TipoEvento" NOT NULL DEFAULT 'CULTO',
    "local" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Escala" (
    "id" TEXT NOT NULL,
    "eventoId" TEXT NOT NULL,
    "membroId" TEXT NOT NULL,
    "departamentoId" TEXT,
    "funcao" TEXT NOT NULL,
    "confirmado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Escala_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lancamento" (
    "id" TEXT NOT NULL,
    "tipo" "TipoLancamento" NOT NULL,
    "categoria" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "descricao" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "cultoId" TEXT,
    "comprovante" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lancamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfiguracaoIgreja" (
    "id" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "ConfiguracaoIgreja_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_membroId_key" ON "User"("membroId");

-- CreateIndex
CREATE UNIQUE INDEX "Membro_email_key" ON "Membro"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Departamento_nome_key" ON "Departamento"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "MembroDepto_membroId_departamentoId_key" ON "MembroDepto"("membroId", "departamentoId");

-- CreateIndex
CREATE UNIQUE INDEX "Escala_eventoId_membroId_funcao_key" ON "Escala"("eventoId", "membroId", "funcao");

-- CreateIndex
CREATE UNIQUE INDEX "ConfiguracaoIgreja_chave_key" ON "ConfiguracaoIgreja"("chave");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_membroId_fkey" FOREIGN KEY ("membroId") REFERENCES "Membro"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembroDepto" ADD CONSTRAINT "MembroDepto_membroId_fkey" FOREIGN KEY ("membroId") REFERENCES "Membro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembroDepto" ADD CONSTRAINT "MembroDepto_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "Departamento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Escala" ADD CONSTRAINT "Escala_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "Evento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Escala" ADD CONSTRAINT "Escala_membroId_fkey" FOREIGN KEY ("membroId") REFERENCES "Membro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Escala" ADD CONSTRAINT "Escala_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "Departamento"("id") ON DELETE SET NULL ON UPDATE CASCADE;
