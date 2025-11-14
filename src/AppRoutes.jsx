import { Route, Routes, BrowserRouter } from "react-router-dom"
import { Home } from "./components/home/home"
import { Property } from "./components/properties/property"
import { SearchPage } from "./components/search/search"
import { LoginPage } from "./components/login/login"
import { RegisterPage } from "./components/register/register"
import { ForgotPasswordPage } from "./components/login/forgotPassword"
import { ResetPasswordPage } from "./components/login/resetPassword"
import { ProfilePage } from "./components/profile/profile"
import { FavoritesPage } from "./components/profile/favorites"
import { BookingsPage } from "./components/profile/bookings"
import { PublishPropertyPage } from "./components/publish/publish"
import { ListingsPage } from "./components/profile/listings"
import { EditListingPage } from "./components/profile/editListing"

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listing/:id" element={<Property />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/profile/bookings" element={<BookingsPage />} />
        <Route path="/profile/listings" element={<ListingsPage />} />
        <Route path="/profile/listings/:id" element={<EditListingPage />} />
        <Route path="/publish" element={<PublishPropertyPage />} />
      </Routes>
    </BrowserRouter>
  )
}
