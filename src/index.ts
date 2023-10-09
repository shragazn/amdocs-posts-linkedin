import linkedIn, { login } from "@services/linked-in";
import dotenv from "dotenv";
import { writeFileSync, readFileSync } from "fs";
import { USERS } from "./constants/users";
import { getPosts } from "./services/linked-in/linked-in.service";
import { FlatPost, Post, User, UserPosts } from "./types/posts";
import { json2csv } from "json-2-csv";
import { outputDir } from "./constants/system";

dotenv.config();

const getPostsByUsers = async () => {
  const posts = [];
  for (const user of USERS) {
    const userPosts = await getPosts(user);
    if (userPosts?.posts.length) {
      console.info(`added ${userPosts.posts.length} posts for ${user.name}`);
      posts.push(userPosts);
    }
  }
  return posts;
};

const flattenPosts = (posts: UserPosts[]) => {
  return posts.reduce((acc, curr) => {
    curr.posts.forEach((post) => {
      const postObj = {
        name: curr.name,
        ...post,
        hashTags: post.hashTags.join(", "),
      };
      acc.push(postObj);
    });
    return acc;
  }, [] as FlatPost[]);
};

const createReport = async (posts: UserPosts[]) => {
  const postsFlat = flattenPosts(posts);
  const csv = await json2csv(postsFlat);
  writeFileSync(`${outputDir}/posts.csv`, csv);
};

const createSummary = async (posts: UserPosts[]) => {
  const summery = posts.reduce((acc, curr) => {
    const userSummary: Record<string, string | number> = { name: curr.name };
    userSummary.numberOfPosts = curr.posts.length;
    const { likes, comments, shares, hashTags } = curr.posts.reduce(
      (acc, curr) => {
        acc.likes += curr.likes;
        acc.comments += curr.comments;
        acc.shares += curr.shares;
        acc.hashTags += curr.hashTags
          .filter((hashTag) => !acc.hashTags.includes(hashTag))
          .map((hashTag) => hashTag + ", ");
        return acc;
      },
      { likes: 0, comments: 0, shares: 0, hashTags: "" } as {
        likes: number;
        comments: number;
        shares: number;
        hashTags: string;
      }
    );
    userSummary.totalLikes = likes;
    userSummary.totalComments = comments;
    userSummary.totalShares = shares;
    userSummary.hashTags = hashTags;
    acc.push(userSummary);
    return acc;
  }, [] as Record<string, string | number>[]);
  const csv = await json2csv(summery);
  writeFileSync(`${outputDir}/summary.csv`, csv);
};

const main = async () => {
  await linkedIn();
  await login();
  const posts = await getPostsByUsers();
  await createReport(posts);
  await createSummary(posts);
};

export default main;
