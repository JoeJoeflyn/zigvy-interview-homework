import {
  type RouteConfig,
  route,
} from "@react-router/dev/routes";

export default [
  route("/register", "./pages/register.tsx"),
  // * matches all URLs, the ? makes it optional so it will match / as well
  route("*?", "catchall.tsx"),
] satisfies RouteConfig;
