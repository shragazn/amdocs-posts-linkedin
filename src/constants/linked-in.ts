import dotenv from "dotenv";
dotenv.config();

export const BASE_URL = "https://www.linkedin.com";
export const ROUTES = {
  login: "/login",
  profile: (username: string) => `/in/${username}`,
  posts: (userId: string) =>
    `search/results/content/?fromMember=%5B%22${userId}%22%5D&sortBy=%22date_posted%22`,
};
export const LOGIN = {
  username: process.env.LINKED_IN_USERNAME!,
  password: process.env.LINKED_IN_PASSWORD!,
};
export const SELECTORS = {
  login: {
    username: "#session_key",
    password: "#session_password",
    submit: '[data-id="sign-in-form__submit-btn"]',
  },
  profile: {
    name: ".text-heading-xlarge",
    infoCard: ".artdeco-card.ember-view",
  },
  posts: {
    postAuthor: ".update-components-actor__container.display-flex.flex-grow-1",
    postTime: ".update-components-text-view.break-words > span > span",
    postText:
      ".update-components-text.relative.update-components-update-v2__commentary > span > span > span",
    menu: {
      container: ".feed-shared-control-menu.display-flex",
      shareBtn: ".option-share-via",
    },
    toast: {
      container: ".artdeco-toast-item--visible",
      close: ".artdeco-toast-item__dismiss",
    },
    reactionCounter: ".social-details-social-counts__item",
  },
  header: {
    signInBtn:
      '[data-tracking-control-name="public_profile_nav-header-signin"]',
  },
};

export const userIdDelimiter = "sd_profile%3A";
export const args = [
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-infobars",
  "--window-position=0,0",
  "--disable-gpu",
  "--ignore-certifcate-errors",
  "--ignore-certifcate-errors-spki-list",
  '--Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"',
];