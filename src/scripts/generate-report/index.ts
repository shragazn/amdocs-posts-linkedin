import linkedIn, { login } from "@services/linked-in";
import dotenv from "dotenv";
import { writeFileSync } from "fs";
import { json2csv } from "json-2-csv";
import { outputDir } from "../../constants/system";
import { USERS } from "../../constants/users";
import { getPosts } from "@/modules/posts";
import { FlatPost, User, UserPosts } from "../../types/posts";

dotenv.config();

const getUsers = () => {
  return USERS;
};

const getPostsByUsers = async (users: User[], dates: [Date, Date]) => {
  const posts = [];
  for (const user of users) {
    const userPosts = await getPosts(user, dates);
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

const createReport = (posts: UserPosts[]) => {
  const postsFlat = flattenPosts(posts);
  return json2csv(postsFlat);
};

const createSummary = (posts: UserPosts[]) => {
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
  return json2csv(summery);
};

export const generateReports = async (from: Date, to: Date) => {
  await linkedIn();
  await login();
  const users = getUsers();
  const posts = await getPostsByUsers(users, [from, to]);
  const [report, summary] = await Promise.all([
    createReport(posts),
    createSummary(posts),
  ]);
  return { report, summary };
};
