# Moodle Scraper

- A Website that shows new assignments without having to autthenticate
- Uses Web notifications to notify you of new assignments & changes to existing assignments

## Self Hosting

- Clone the repository
- Install dependencies and setup the database using `pnpm run init`
- Create an `.env` file in the root directory (refer to `.env.example`)
- Run the server using `pnpm run prod`

## Note

- This uses Next.js to serve the website and has backend code to sync the assignments
- With a few modifications, it is possible to statically deploy the frontend part and host just the backend part on a server
