export type LoginPayload = { email: string; password: string };
export type SignupPayload = { email: string; password: string; first_name?: string; last_name?: string };
export type AuthResponse = {
  // adjust to your backend shape; keep both supported
  access?: string;          // JWT (SimpleJWT)
  refresh?: string;         // JWT refresh
  token?: string;           // any other token field
  user?: {
    id?: string | number;
    email: string;
    first_name?: string;
    last_name?: string;
    display_name?: string;
  };
  detail?: string;          // error/help text
};
