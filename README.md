# Moodle LMS

- A Website that shows new assignments (from a moodle based website) without having to authenticate
- Uses Web notifications to notify you of new assignments & changes to existing assignments
- It also keeps a backup of course files (pdf/ppts). However, these require authentication (at cloudflare level) to view

## Screenshots
![ss1](https://github.com/siriscmv/moodle-scraper/assets/40269790/6b0baff3-0547-4ee9-a3ee-7c48214360b1)  
![ss2](https://github.com/siriscmv/moodle-scraper/assets/40269790/e63d760b-2a0c-48a2-8f81-dcfe5fd36513)


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
