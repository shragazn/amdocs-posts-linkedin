import { SELECTORS, userIdDelimiter } from "@/constants/linked-in";
import { page } from "@/services/linked-in/linked-in.service";

export const getProfile = async (profileUrl: string) => {
  await page.goto(profileUrl);
  await page.waitForSelector(SELECTORS.profile.infoCard);
  const name = await page.$eval(SELECTORS.profile.name, (el) => el.textContent);
  const id = await page.$$eval(
    "[href]",
    (els, userIdDelimiter) => {
      const href = els
        .find((el) => el.getAttribute("href")?.includes(userIdDelimiter))
        ?.getAttribute("href");
      return href?.split(userIdDelimiter)[1];
    },
    userIdDelimiter
  );
  return { name, id };
};
