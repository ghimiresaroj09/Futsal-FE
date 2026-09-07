import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { RouteError } from "@/components/common/RouteError";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { AboutPage } from "@/pages/AboutPage";
import { BookingsPage } from "@/pages/BookingsPage";
import { ChangePasswordPage } from "@/pages/ChangePasswordPage";
import { ContactPage } from "@/pages/ContactPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { GalleryPage } from "@/pages/GalleryPage";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { OtpVerificationPage } from "@/pages/OtpVerificationPage";
import { ProfileEditPage } from "@/pages/ProfileEditPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";
import { SignUpPage } from "@/pages/SignUpPage";
import { ViewBookingsPage } from "@/pages/ViewBookingsPage";

/**
 * Central route table. Public pages live under <PublicLayout /> (Navbar:
 * logo left, nav center, Login/Sign Up right). When an app shell is needed,
 * add another layout route with <AppLayout /> (sidebar) and/or <AuthGuard />.
 */
const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement: <RouteError />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/bookings", element: <BookingsPage /> },
      { path: "/view-bookings", element: <ViewBookingsPage /> },
      { path: "/gallery", element: <GalleryPage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/contact", element: <ContactPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignUpPage /> },
      { path: "/profile", element: <ProfilePage /> },
      { path: "/profile/edit", element: <ProfileEditPage /> },
      { path: "/change-password", element: <ChangePasswordPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/verify-otp", element: <OtpVerificationPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
