import { lazyPage } from "@/lib/lazyPage";
import type { RouteObject } from "react-router-dom";
import { paths } from "@/router/paths";
const Login = lazyPage(() => import("./Login"), "Login");
const LoginSplit = lazyPage(() => import("./LoginSplit"), "LoginSplit");
const Register = lazyPage(() => import("./Register"), "Register");
const RegisterSplit = lazyPage(() => import("./RegisterSplit"), "RegisterSplit");
const ForgotPassword = lazyPage(() => import("./ForgotPassword"), "ForgotPassword");
const ResetPassword = lazyPage(() => import("./ResetPassword"), "ResetPassword");
const TwoFactor = lazyPage(() => import("./TwoFactor"), "TwoFactor");
const LockScreen = lazyPage(() => import("./LockScreen"), "LockScreen");
const VerifyEmail = lazyPage(() => import("./VerifyEmail"), "VerifyEmail");
const SessionTimeout = lazyPage(() => import("./SessionTimeout"), "SessionTimeout");
const Maintenance = lazyPage(() => import("./Maintenance"), "Maintenance");
const ErrorPage = lazyPage(() => import("./ErrorPage"), "ErrorPage");
const NotFound = lazyPage(() => import("./NotFound"), "NotFound");

export const authRoutes: RouteObject[] = [
  { path: paths.auth.login, element: <Login /> },
  { path: paths.auth.loginSplit, element: <LoginSplit /> },
  { path: paths.auth.register, element: <Register /> },
  { path: paths.auth.registerSplit, element: <RegisterSplit /> },
  { path: paths.auth.forgotPassword, element: <ForgotPassword /> },
  { path: paths.auth.resetPassword, element: <ResetPassword /> },
  { path: paths.auth.twoFactor, element: <TwoFactor /> },
  { path: paths.auth.lockScreen, element: <LockScreen /> },
  { path: paths.auth.verifyEmail, element: <VerifyEmail /> },
  { path: paths.auth.sessionTimeout, element: <SessionTimeout /> },
  { path: paths.auth.maintenance, element: <Maintenance variant="maintenance" /> },
  { path: paths.auth.error(":code"), element: <ErrorPage /> },
  { path: paths.auth.notFound, element: <NotFound /> },
];
