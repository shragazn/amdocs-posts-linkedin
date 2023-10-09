export type User = {
    name: string;
    id: string;
}

export type UserPosts = User & { posts: Post[] }

export type Post = {
    date: string;
    text: string | null;
    hashTags: string[];
    link: string | undefined;
    likes: number;
    comments: number;
    shares: number;
}

export type FlatPost = Omit<Post,"hashTags"> & { hashTags: string, name:string };