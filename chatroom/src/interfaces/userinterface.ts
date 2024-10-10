export interface User {
  user_num: number | null;
  email: string;
  username: string;
  hashed_password: string;
  salt: string;
  user_profile: string;
  friends: number[];
  blocked: number[];
  groups: number[];
}

export interface UserContextValue {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}
