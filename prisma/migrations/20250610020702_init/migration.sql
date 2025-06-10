-- CreateTable
CREATE TABLE "SharedFolder" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "folderId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "expDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SharedFolder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SharedFolder_uuid_key" ON "SharedFolder"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "SharedFolder_folderId_key" ON "SharedFolder"("folderId");

-- CreateIndex
CREATE UNIQUE INDEX "SharedFolder_userId_folderId_key" ON "SharedFolder"("userId", "folderId");

-- AddForeignKey
ALTER TABLE "SharedFolder" ADD CONSTRAINT "SharedFolder_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedFolder" ADD CONSTRAINT "SharedFolder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
