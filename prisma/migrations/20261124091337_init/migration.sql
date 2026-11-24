-- CreateTable
CREATE TABLE "Kpi" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "icon" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "initial" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "change" REAL NOT NULL,
    "direction" TEXT NOT NULL,
    "position" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "RevenuePoint" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "period" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "current" REAL,
    "previous" REAL,
    "currentLabel" TEXT NOT NULL,
    "previousLabel" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UserGrowthPoint" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "period" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "current" INTEGER,
    "previous" INTEGER,
    "currentLabel" TEXT NOT NULL,
    "previousLabel" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "CategorySale" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "label" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "color" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "RegionPerformance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "percentage" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "seconds" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "RevenuePoint_period_position_key" ON "RevenuePoint"("period", "position");

-- CreateIndex
CREATE UNIQUE INDEX "UserGrowthPoint_period_position_key" ON "UserGrowthPoint"("period", "position");

-- CreateIndex
CREATE UNIQUE INDEX "CategorySale_label_key" ON "CategorySale"("label");

-- CreateIndex
CREATE UNIQUE INDEX "RegionPerformance_key_key" ON "RegionPerformance"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");
