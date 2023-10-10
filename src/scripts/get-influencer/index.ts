import { getProfile } from "@/modules/profile";
import linkedIn, { login } from "@/services/linked-in";

export const getInfluencer = async (profileUrl: string) => {
  await linkedIn();
  await login();
  const influencer = await getProfile(profileUrl);
  return influencer;
};
