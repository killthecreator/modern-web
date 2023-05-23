import type { User } from "@clerk/nextjs/dist/api";

const filterUserForClient = ({ id, username, profileImageUrl }: User) => {
  return {
    id,
    username,
    profileImageUrl,
  };
};

export default filterUserForClient;
