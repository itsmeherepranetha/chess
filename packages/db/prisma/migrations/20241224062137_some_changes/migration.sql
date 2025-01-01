/*
  Warnings:

  - You are about to drop the column `notation` on the `Move` table. All the data in the column will be lost.
  - Added the required column `from` to the `Move` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to` to the `Move` table without a default value. This is not possible if the table is not empty.
  - Added the required column `provider` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('EMAIL', 'GOOGLE', 'FACEBOOK', 'GITHUB');

-- AlterTable
ALTER TABLE "Move" DROP COLUMN "notation",
ADD COLUMN     "from" TEXT NOT NULL,
ADD COLUMN     "to" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "name" TEXT,
ADD COLUMN     "provider" "AuthProvider" NOT NULL,
ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL;
