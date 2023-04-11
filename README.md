# Moodle Scraper

- A Website that shows new assignments without having to authenticate
- Uses Web notifications to notify you of new assignments & changes to existing assignments
- It also scrapes and stores course files (pdf/ppts). However, these require authentication (at cloudflare level) to view

## Self Hosting

- Clone the repository
- Install dependencies and setup the database using `pnpm run init`
- Create an `.env` file in the root directory (refer to `.env.example`)
- Run the server using `pnpm run prod`

### Self Hosting options

- Your own computer (if you have a static IP & if it is on 24/7)
- A small VPS / Dedicated server (OVH, Digital Ocean, Hetzner, etc.)
- Free tiers of cloud providers (AWS, GCP, Azure, Oracle, etc.)
- [Hop](https://hop.io/)
- [Fly.io](https://fly.io)
- [Cyclic](https://cyclic.sh/)
- [Railway](https://railway.app) (free tier lasts for about 20 days a month)

## Note

- This uses Next.js to serve the website and has backend code to sync the assignments
- With a few modifications, it is possible to statically deploy the frontend part and host just the backend part on a server
