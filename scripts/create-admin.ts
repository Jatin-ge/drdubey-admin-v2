import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.adminProfile.findFirst()
  if (existing) {
    console.log('Admin account already exists:', existing.userName)
    return
  }
  const hashed = await bcrypt.hash('DubayAdmin@2024', 10)
  const admin = await prisma.adminProfile.create({
    data: {
      userName: 'admin',
      password: hashed,
    }
  })
  console.log('Admin created:', admin.userName)
  console.log('Password: DubayAdmin@2024')
  console.log('IMPORTANT: Change this password after first login')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
