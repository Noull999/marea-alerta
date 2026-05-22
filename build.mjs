import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function build() {
  try {
    if (process.env.DATABASE_URL) {
      console.log('Deploying database migrations...')
      await execAsync('npx prisma migrate deploy')
    } else {
      console.log('Skipping migrations (no DATABASE_URL)')
    }

    console.log('Building Next.js...')
    await execAsync('next build')
    console.log('Build completed successfully')
  } catch (error) {
    console.error('Build failed:', error.message)
    process.exit(1)
  }
}

build()
