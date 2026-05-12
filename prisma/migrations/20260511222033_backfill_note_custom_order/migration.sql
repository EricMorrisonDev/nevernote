-- 1) Add column nullable so existing rows are valid
ALTER TABLE "notes" ADD COLUMN "customOrder" DOUBLE PRECISION;

-- 2) Backfill: spaced ranks per notebook by creation time (gaps for future midpoint inserts)
UPDATE "notes" AS n
SET "customOrder" = sub.rank
FROM (
  SELECT
    id,
    (ROW_NUMBER() OVER (
      PARTITION BY "notebookId"
      ORDER BY "createdAt" ASC, id ASC
    ))::double precision * 1000.0 AS rank
  FROM "notes"
) AS sub
WHERE n.id = sub.id;

-- 3) Require values going forward (matches Prisma schema)
ALTER TABLE "notes" ALTER COLUMN "customOrder" SET NOT NULL;
