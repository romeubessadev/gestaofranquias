import { lazyPage } from "@/lib/lazyPage";
import type { RouteObject } from "react-router-dom";
import { paths } from "@/router/paths";

const Login = lazyPage(() => import("./Login"), "Login");
const Recuperar = lazyPage(() => import("./Recuperar"), "Recuperar");
const Redefinir = lazyPage(() => import("./Redefinir"), "Redefinir");
const Convite = lazyPage(() => import("./Convite"), "Convite");
const Instalar = lazyPage(() => import("./Instalar"), "Instalar");

export const acessoRoutes: RouteObject[] = [
  { path: paths.acesso.entrar, element: <Login /> },
  { path: paths.acesso.recuperar, element: <Recuperar /> },
  { path: paths.acesso.redefinir(), element: <Redefinir /> },
  { path: paths.acesso.convite(), element: <Convite /> },
  { path: paths.acesso.instalar, element: <Instalar /> },
];
