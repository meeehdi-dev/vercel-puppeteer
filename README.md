# Vercel Puppeteer

Vercel Puppeteer is a simple vercel/node project allowing to use puppeteer with vercel serverless functions.

*The vercel.json attached to the project only works for Vercel Pro subscriptions. You can try to lower the specs if you use the free tier but I don't recommend it due to the 10 second timeout.*

## Dependencies

chromium-min: [Github](https://github.com/sparticuz/chromium) by [Sparticuz](https://github.com/Sparticuz)  
puppeteer-core: [Github](https://github.com/puppeteer/puppeteer)

You'll also need to host a chromium-pack, downloadable via Sparticuz's [chromium releases](https://github.com/Sparticuz/chromium/releases). I personally use AWS S3. Just make sure it's a fast delivery service to avoid any timeout on your serverless function.


## Installation

Clone the repo.
```
git clone git@github.com:meeehdi-dev/vercel-puppeteer.git
```
Install the dependencies.
```
pnpm i
```
Set up your environment variables.
```
TOKEN="XXX"
# Public path to chromium pack
CHROMIUM_PATH="https://storage.example.org/chromium-pack.tar"
# or if using a private S3 bucket
AWS_S3_REGION="eu-west-3"
AWS_S3_BUCKET="private-bucket"
AWS_S3_KEY="chromium-pack.tar"
AWS_ACCESS_KEY_ID="KEY_ID"
AWS_SECRET_ACCESS_KEY="ACCESS_KEY"
```
Deploy using Vercel CLI (don't forget to set the env vars in the dashboard).
```
vercel deploy
```

## Usage

Send a request with a "X-TOKEN" header and a body containing the HTML content you want transformed as a PDF.


### Using Curl
```bash
curl -X POST -L "https://puppeteer.example.org/api/pdf" -d "<html><body><div>Hello world!</div></body></html>" -H "Content-Type: text/plain" -H "X-TOKEN: ENV_TOKEN" -o "test.pdf"
```


### Using NodeJS (with [node-fetch](https://github.com/node-fetch/node-fetch))
```typescript
const response = await fetch("https://puppeteer.example.org/api/pdf", {
    method: "POST",
    body: html,
    headers: {
      "X-TOKEN": ENV_TOKEN,
    },
});

// transform the pdf into a buffer
const arrayBuffer = await response.arrayBuffer();
const buffer = Buffer.from(arrayBuffer);
return buffer;
```

## TODO

This list is just a reminder for improvements but I'm probably not going to work on them right now.

[] Move the browser inititialization to a utils file  
[] Add other API endpoints (e.g. /screenshot)
