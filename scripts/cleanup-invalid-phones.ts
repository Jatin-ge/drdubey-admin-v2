import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function normalizePhone(raw: string | null | undefined): string {
  if (!raw) return '';
  const digitsOnly = (raw.match(/\d/g) || []).join('');
  return digitsOnly;
}

function isValidTenDigitPhone(raw: string | null | undefined): boolean {
  const digits = normalizePhone(raw);
  return digits.length === 10;
}

async function main() {
  console.log('Finding leads with invalid or missing phone numbers...');

  const allLeads = await prisma.lead.findMany({ select: { id: true, phone: true, name: true } });

  const invalidLeadIds = allLeads
    .filter((l) => !isValidTenDigitPhone(l.phone))
    .map((l) => l.id);

  console.log(`Total leads: ${allLeads.length}`);
  console.log(`Invalid or missing phone leads to delete: ${invalidLeadIds.length}`);

  if (invalidLeadIds.length === 0) {
    console.log('No invalid leads found.');
    return;
  }

  // Delete related payments first due to relation
  const delPayments = await prisma.payments.deleteMany({ where: { userPaymentId: { in: invalidLeadIds } } });
  const delLeads = await prisma.lead.deleteMany({ where: { id: { in: invalidLeadIds } } });

  console.log(`Deleted payments: ${delPayments.count}`);
  console.log(`Deleted leads: ${delLeads.count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


