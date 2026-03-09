-- CreateTable
CREATE TABLE "StudentMemory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "paisOrigen" TEXT,
    "llenguaL1" TEXT,
    "alfabetitzacioLlatina" TEXT,
    "nivellMECR" TEXT,
    "necessitatsSuport" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ClassMemory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "configuracioMultinivell" BOOLEAN NOT NULL DEFAULT false,
    "estilSuportPreferit" TEXT NOT NULL DEFAULT 'mixt',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SubjectProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomAssignatura" TEXT NOT NULL,
    "estilRedaccio" TEXT NOT NULL DEFAULT 'cientific',
    "termesIntocables" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Adaptation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "textOriginal" TEXT NOT NULL,
    "fontText" TEXT,
    "edat" TEXT,
    "nivellDificultat" TEXT,
    "ajuts" TEXT,
    "traduccio" TEXT,
    "taulaComparativa" BOOLEAN NOT NULL DEFAULT true,
    "modeMultinivell" BOOLEAN NOT NULL DEFAULT false,
    "studentMemoryId" TEXT,
    "classMemoryId" TEXT,
    "subjectProfileId" TEXT,
    "textAdaptat" TEXT,
    "textAcces" TEXT,
    "textEnriquiment" TEXT,
    "traduccioText" TEXT,
    "auditoria" TEXT,
    "taulaComparativaData" TEXT,
    "pictograms" TEXT,
    "glossari" TEXT,
    "feedbackDocent" TEXT,
    "valoracio" INTEGER,
    "tags" TEXT,
    "assignatura" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdVia" TEXT,
    "modelAdaptador" TEXT,
    "modelAuditor" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "modelAdaptador" TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
    "modelAuditor" TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
    "modelTraductor" TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
    "modelOrquestrador" TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
    "updatedAt" DATETIME NOT NULL
);
