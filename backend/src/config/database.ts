export interface DatabaseConfig {
  url: string
  directUrl: string
}

export function getDatabaseConfig(): DatabaseConfig {
  const url = process.env.DATABASE_URL
  const directUrl = process.env.DIRECT_URL

  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Add your Neon pooled connection string to .env'
    )
  }
  if (!directUrl) {
    throw new Error(
      'DIRECT_URL is not set. Add your Neon direct connection string to .env'
    )
  }

  return { url, directUrl }
}

export function validateDatabaseConnection(): void {
  getDatabaseConfig()
  console.log('Database configuration validated.')
}
