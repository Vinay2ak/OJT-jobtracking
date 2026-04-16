import type { RouteObject } from "react-router";
import { Login } from "./Components/Login";
import { Register } from "./Components/Register";

export const routes: RouteObject[] = [
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/",
    index: true,
  },
];