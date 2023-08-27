import chromium from "@sparticuz/chromium-min";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import puppeteer from "puppeteer-core";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  if (!req.body || typeof req.body !== "string") {
    return res.status(400).send("Bad Request");
  }

  if (req.headers["x-token"] !== process.env.TOKEN) {
    return res.status(401).send("Unauthorized");
  }

  const browser = await puppeteer.launch({
    args: [...chromium.args, "--hide-scrollbars", "--font-render-hinting=none"],
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(process.env.CHROMIUM_PATH),
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
