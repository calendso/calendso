CREATE EXTENSION IF NOT EXISTS citext;
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE CITEXT;
-- UpdateTable
UPDATE users SET email=lower(email);
