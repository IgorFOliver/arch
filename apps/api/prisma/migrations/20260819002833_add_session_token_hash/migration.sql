-- Sessions previously stored the raw bearer token as their primary key.
-- Existing rows cannot be backfilled with a hash of a token we never
-- persisted separately, so they are invalidated here — anyone with an
-- active session needs to log in again after this migration.
DELETE FROM "Session";

-- AlterTable
ALTER TABLE "Session" ADD COLUMN "tokenHash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
