-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT,
    "bio" TEXT,
    "job" TEXT,
    "country" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "birthday" TEXT,
    "status" TEXT,
    "performance" INTEGER,
    "avatar" TEXT,
    "role" TEXT DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailNotifications" BOOLEAN DEFAULT true,
    "pushNotifications" BOOLEAN DEFAULT true,
    "marketingEmails" BOOLEAN DEFAULT false,
    "securityAlerts" BOOLEAN DEFAULT true,
    "facebook" TEXT,
    "twitter" TEXT,
    "instagram" TEXT,
    "linkedin" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fan" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "initiale" TEXT,
    "urlAvatar" TEXT,
    "statut" TEXT NOT NULL,
    "derniereActivite" TIMESTAMP(3),
    "totalDepense" DOUBLE PRECISION DEFAULT 0,

    CONSTRAINT "Fan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contenu" (
    "id" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "urlImage" TEXT NOT NULL,
    "prix" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Contenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "versionTag" TEXT,
    "versionColor" TEXT,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "toId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
