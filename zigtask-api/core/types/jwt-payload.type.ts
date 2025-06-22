export type JwtPayload = {
  sub: string;
  name: string;
  iat?: number;
  exp?: number;
};
