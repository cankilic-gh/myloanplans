-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_recurring_expenses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT,
    "accountId" TEXT,
    "nextDueDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "recurring_expenses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recurring_expenses_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "budget_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "recurring_expenses_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "budget_accounts" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_recurring_expenses" ("accountId", "amount", "categoryId", "createdAt", "description", "frequency", "id", "name", "nextDueDate", "type", "userId") SELECT "accountId", "amount", "categoryId", "createdAt", "description", "frequency", "id", "name", "nextDueDate", "type", "userId" FROM "recurring_expenses";
DROP TABLE "recurring_expenses";
ALTER TABLE "new_recurring_expenses" RENAME TO "recurring_expenses";
CREATE INDEX "recurring_expenses_userId_idx" ON "recurring_expenses"("userId");
CREATE INDEX "recurring_expenses_nextDueDate_idx" ON "recurring_expenses"("nextDueDate");
CREATE INDEX "recurring_expenses_type_idx" ON "recurring_expenses"("type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
