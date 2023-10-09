import puppeteer, { Browser, ElementHandle, Page } from "puppeteer";
import { BASE_URL, LOGIN, ROUTES, SELECTORS, args } from "@/constants/linked-in";
import { delay } from "@/utils";

let page: Page, browser: Browser;

const main = async () => {
  browser = await puppeteer.launch({ headless: "new", args });
  page = (await browser.pages())[0];
};

export const login = async () => {
  await page.goto(BASE_URL);
  await page.waitForSelector(SELECTORS.login.username);
  await page.type(SELECTORS.login.username, LOGIN.username);
  await page.type(SELECTORS.login.password, LOGIN.password);
  await page.click(SELECTORS.login.submit);
  while (true) {
    try {
      await page.waitForNavigation();
      await page.waitForSelector('[aria-label="Main Feed"]');
      break;
    } catch (err) {
      console.error(err);
    }
  }
  console.log("logged in");
  return page;
};

const getPost = async (postElement: ElementHandle) => {
  // post date
  const date = await getDate();
  if(!isValidDate(date)) return console.info("post is too old");

  const textElement = await postElement.$(SELECTORS.posts.postText);
  if (!textElement) return console.info("no text element");

  const postText = await postElement.$eval(
    SELECTORS.posts.postText,
    (el) => el.textContent
  );
  const hashTags = postText?.match(/#[a-zA-Z0-9]+/g) || [];
  const link = await getLink();
  const { likes, comments, shares } = await getReactions();

  const postData = {
    date: date.toISOString().split("T")[0],
    text: postText,
    hashTags: [...new Set(hashTags)],
    link,
    likes,
    comments,
    shares,
  };
  
  console.info("added post", postData);
  return postData;

  function isValidDate(date: Date) {
    const dateThreshold = new Date(); // 3 months ago
    dateThreshold.setMonth(dateThreshold.getMonth() - 3);
    return date > dateThreshold;
  }

  async function getDate() {
    const authorElement = await postElement.$(SELECTORS.posts.postAuthor);
    const time = await authorElement?.$eval(
      SELECTORS.posts.postTime,
      (el) => el.textContent
    );
    const timeframe = time?.match(/\d+(mo|d|w|yr|hr|min)/g)?.[0];
    const date = new Date();
    if (timeframe?.includes("mo")) {
      date.setMonth(date.getMonth() - parseInt(timeframe));
    } else if (timeframe?.includes("d")) {
      date.setDate(date.getDate() - parseInt(timeframe));
    } else if (timeframe?.includes("w")) {
      date.setDate(date.getDate() - parseInt(timeframe) * 7);
    } else if (timeframe?.includes("yr")) {
      date.setFullYear(date.getFullYear() - parseInt(timeframe));
    } else if (timeframe?.includes("hr")) {
      date.setHours(date.getHours() - parseInt(timeframe));
    } else if (timeframe?.includes("min")) {
      date.setMinutes(date.getMinutes() - parseInt(timeframe));
    }
    return date;
  }

  async function getLink() {
    const { menu } = SELECTORS.posts;
    const menuElement = await postElement.$(menu.container);
    const buttonElements = await menuElement?.$("button");
    await buttonElements?.click();
    await Promise.all([page.waitForSelector(menu.shareBtn), delay(200)]);
    const shareBtnElement = await menuElement?.$(menu.shareBtn);
    await shareBtnElement?.click();
    console.log('clicked share button')
    await Promise.all([
      page.waitForSelector(SELECTORS.posts.toast.container),
      delay(200),
    ]);
    const toastElement = await page.$(SELECTORS.posts.toast.container);
    const linkElement = await toastElement?.$("a");
    const link = await linkElement?.evaluate((el) => el.href);
    const closeBtnElement = await toastElement?.$(SELECTORS.posts.toast.close);
    await Promise.all([
        closeBtnElement?.click(),
        delay(200),
    ]) 
    console.log('closed toast')
    return link;
  }

  async function getReactions() {
    const reactions = {
      likes: 0,
      comments: 0,
      shares: 0,
    };
    const reactionCounterElements = await postElement.$$(
      SELECTORS.posts.reactionCounter
    );
    for (const reactionCounterElement of reactionCounterElements) {
      const reactionCounter = await reactionCounterElement.evaluate(
        (el) => el.textContent
      );
      if (reactionCounter?.includes("comment")) {
        reactions.comments = parseInt(reactionCounter.replace(/\D/g, ""));
      } else if (reactionCounter?.includes("repost")) {
        reactions.shares = parseInt(reactionCounter.replace(/\D/g, ""));
      } else {
        reactions.likes = parseInt(reactionCounter?.replace(/\D/g, "") || "0");
      }
    }
    return reactions;
  }
};

export const getPosts = async ({ id, name }: { id: string; name: string }) => {
  await page.goto(`${BASE_URL}/${ROUTES.posts(id)}`);
  await page.waitForSelector("main");
  const mainElement = await page.$("main");
  const postListElement = await mainElement?.$("ul");
  const postElements = await postListElement?.$$("li");
  if (!postElements) return;

  const posts = [];
  for (const postElement of postElements) {
    try {
      const post = await getPost(postElement);
      if (post) posts.push(post);
    } catch (err) {
      console.error(err);
    }
  }
  return { name, id, posts };
};

export const scrapePosts = async (range: number) => {
  //range by months
  await page.waitForSelector(SELECTORS.posts.postAuthor);
  const posts = [];
  let oldPosts = false;
  while (!oldPosts) {
    const postAuthors = await page.$$(SELECTORS.posts.postAuthor);
    for (const postAuthor of postAuthors) {
    }
  }
};

export default main;
