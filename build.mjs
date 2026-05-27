import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

async function build() {
  try {
    console.log('Generating Prisma Client...')
    try {
      const { stdout, stderr } = await execAsync('npx prisma generate')
      console.log('Prisma generation output:', stdout)
      if (stderr) console.log('Prisma generation stderr:', stderr)
      console.log('Prisma Client generated successfully')
    } catch (genError) {
      console.error('Prisma generation error:', genError.message)
      console.log('Continuing despite generation error...')
    }

    if (process.env.DATABASE_URL) {
      console.log('Deploying database migrations...')
      try {
        const { stdout, stderr } = await execAsync('npx prisma migrate deploy')
        console.log('Migrations output:', stdout)
        if (stderr) console.log('Migrations stderr:', stderr)
        console.log('Migrations deployed successfully')
      } catch (migrateError) {
        console.error('Migration error:', migrateError.message)
        console.log('Continuing with build despite migration error...')
      }
    } else {
      console.log('Skipping migrations (no DATABASE_URL)')
    }

    console.log('Building Next.js...')
    const { stdout } = await execAsync('next build')
    console.log(stdout)
    console.log('Build completed successfully')
  } catch (error) {
    console.error('Build failed:', error.message)
    process.exit(1)
  }
}

build()
