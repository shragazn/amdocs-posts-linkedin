import { BASE_URL, LOGIN, SELECTORS, args } from "@/constants/linked-in";
import puppeteer, { Browser, Page } from "puppeteer";

export let page: Page, browser: Browser;

const main = async () => {
  if (browser && page) return;
  browser = await puppeteer.launch({ headless: false, args });
  page = (await browser.pages())[0];
};

const getIsLoggedIn = async () => {
  console.log(
    "🚀 ~ file: linked-in.service.ts:15 ~ getIsLoggedIn ~ page.url():",
    page.url()
  );
  return (
    page.url().includes(BASE_URL) &&
    (await page.evaluate(() => {
      const signInBtn = document.querySelector(
        '[data-tracking-control-name="public_profile_nav-header-signin"]'
      );
      return !signInBtn;
    }))
  );
};

export const login = async () => {
  let loggedIn = await getIsLoggedIn();
  if (loggedIn) {
    console.info("already logged in");
    return page;
  }
  console.info("logging in");
  await page.goto(BASE_URL);
  await page.waitForSelector(SELECTORS.login.username);
  await page.type(SELECTORS.login.username, LOGIN.username);
  await page.type(SELECTORS.login.password, LOGIN.password);
  console.info("entered credentials");
  await page.click(SELECTORS.login.submit);
  while (true) {
    try {
      await page.waitForNavigation();
      loggedIn = await getIsLoggedIn();
      if (loggedIn) {
        console.log("logged in");
        break;
      }
    } catch (err) {
      console.error(err);
    }
  }
  return page;
};

export default main;
