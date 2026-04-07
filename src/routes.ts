import type { RouteObject } from "react-router";
import { Login } from "./Components/Login";
import { Signup } from "./Components/Signup";

export const routes: RouteObject[] = [
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/signup",
    Component: Signup,
  },
  {
    path: "/",
    index: true,
  },
];