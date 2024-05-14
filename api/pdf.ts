import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { fromEnv } from "@aws-sdk/credential-providers";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import chromium from "@sparticuz/chromium-min";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import puppeteer from "puppeteer-core";

export const maxDuration = 60;

function getExecutablePath(): string | Promise<string> | undefined {
  if (process.env.AWS_S3_BUCKET && process.env.AWS_S3_KEY) {
    const s3Client = new S3Client({
      region: process.env.AWS_S3_REGION,
      credentials: fromEnv(),
    });

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: process.env.AWS_S3_KEY,
    });
    return getSignedUrl(s3Client, command);
  } else if (process.env.CHROMIUM_PATH) {
    return process.env.CHROMIUM_PATH;
  }
  return undefined;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    return res.status(200).send("ok"); // warmup
  }

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  if (!req.body || typeof req.body !== "string") {
    return res.status(400).send("Bad Request");
  }

  if (req.headers["x-token"] !== process.env.TOKEN) {
    return res.status(401).send("Unauthorized");
  }

  const executablePath = await getExecutablePath();

  if (!executablePath) {
    return res.status(500).send("Internal Server Error");
  }

  const browser = await puppeteer.launch({
    args: [...chromium.args, "--hide-scrollbars", "--font-render-hinting=none"],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(executablePath),
    headless: chromium.headless,
  });
  const page = await browser.newPage();
  await page.setContent(req.body, {
    waitUntil: ["networkidle0", "domcontentloaded"],
  });
  await page.waitForFunction("document.fonts.ready");
  await page.screenshot(); // possible fix for fonts (https://github.com/puppeteer/puppeteer/issues/422#issuecomment-1059759640)
  const buffer = await page.pdf({
    format: "a4",
    printBackground: true,
    margin: { top: 16, left: 16, right: 16, bottom: 16 },
  });

  return res.send(buffer);
}
