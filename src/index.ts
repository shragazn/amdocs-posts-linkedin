import { getInfluencer } from "@/scripts";

const main = async () => {
  const user = await getInfluencer(
    "https://www.linkedin.com/in/ido-zrihen-b42a431b9"
  );
  console.log("🚀 ~ file: index.ts:5 ~ main ~ user:", user);
};

main();
