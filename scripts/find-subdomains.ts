// scripts/find-subdomains.ts
import 'dotenv/config'
import fs from 'fs/promises'
import path from 'path'
import https from 'https'

const DOMAIN = 'michaeldemar.co'
const OUTPUT_PATH = path.join(process.cwd(), 'src/data/subdomains.json')

// You'll need to set these in your .env file
const CF_ZONE_ID = process.env.CF_ZONE_ID
const CF_API_TOKEN = process.env.CF_API_TOKEN

interface CloudflareRecord {
  name: string
  type: string
  content: string
  proxied: boolean
}

interface SubdomainInfo {
  name: string
  type: string
  active: boolean
  proxied: boolean
  target?: string
}

async function getCloudflareRecords(): Promise<CloudflareRecord[]> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.cloudflare.com',
      path: `/client/v4/zones/${CF_ZONE_ID}/dns_records`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        try {
          const response = JSON.parse(data)
          if (response.success && response.result) {
            resolve(response.result)
          } else {
            reject(new Error('Failed to fetch DNS records'))
          }
        } catch (error) {
          reject(error)
        }
      })
    })

    req.on('error', (error) => reject(error))
    req.end()
  })
}

async function findSubdomains() {
  try {
    if (!CF_ZONE_ID || !CF_API_TOKEN) {
      throw new Error('Missing Cloudflare credentials in environment variables')
    }

    console.log('Fetching DNS records from Cloudflare...')
    const records = await getCloudflareRecords()

    // Process records into subdomains
    const subdomains: SubdomainInfo[] = records
      .filter((record) => ['A', 'CNAME', 'AAAA'].includes(record.type))
      .map((record) => ({
        name:
          record.name === DOMAIN ? '@' : record.name.replace(`.${DOMAIN}`, ''),
        type: record.type,
        active: true, // All records in Cloudflare are considered active
        proxied: record.proxied,
        target: record.content,
      }))
      .sort((a, b) => {
        // Sort: root domain first, then alphabetically
        if (a.name === '@') return -1
        if (b.name === '@') return 1
        return a.name.localeCompare(b.name)
      })

    // Ensure the data directory exists
    await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true })

    // Write results to JSON file
    await fs.writeFile(
      OUTPUT_PATH,
      JSON.stringify(
        {
          domain: DOMAIN,
          subdomains,
        },
        null,
        2
      )
    )

    console.log('\nSubdomain discovery complete!')
    console.log(`Found ${subdomains.length} subdomains`)
    console.log(`Results written to ${OUTPUT_PATH}`)
  } catch (error) {
    console.error('Error during subdomain discovery:', error)
    console.error('\nMake sure you have set these environment variables:')
    console.error('CF_ZONE_ID - Your Cloudflare Zone ID')
    console.error('CF_API_TOKEN - Your Cloudflare API Token')
    process.exit(1)
  }
}

findSubdomains()
