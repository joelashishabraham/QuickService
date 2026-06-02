import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import MobileBottomNav from "./components/layout/MobileBottomNav";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/layout/Sidebar";
/* Pages */
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Services from "./pages/Services";
import MyBookings from "./pages/MyBookings";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import VerifyOtp from "./pages/VerifyOtp";
import Profile from "./pages/Profile";
import ServiceDetail from "./pages/ServiceDetail";
import SellerProfile from "./pages/SellerProfile";
import MapSearch from "./pages/MapSearch";
import Payment from "./pages/Payment";
import ReviewPage from "./pages/ReviewPage";
import Booking from "./pages/Booking";
import CreateService from "./pages/CreateService";
import BookingSuccess from "./pages/BookingSuccess";
import EditService from "./pages/EditService";
import ChatList from "./pages/ChatList";
import ServiceForm from "./pages/ServiceForm";
import AdminPanel from "./pages/AdminPanel";
import ServicePage from "./pages/ServicePage";
import PromoteService from "./components/PromoteService";


export default function AppRoutes() {

const location = useLocation();

/* Show Navbar only on Home */

const showNavbar = location.pathname === "/";

/* Hide Mobile Nav on login/register */

const hideMobileNav =
location.pathname === "/login" ||
location.pathname === "/register";

return (
<>

{/* NAVBAR */}
{showNavbar && <Navbar />}

<Routes>

{/* PUBLIC ROUTES */}

<Route path="/" element={<Home />} />
<Route path="/services" element={<Services />} />
<Route path="/service/:id" element={<ServiceDetail />} />
<Route path="/seller/:id" element={<SellerProfile />} />
{/* ✅ NEW SETTINGS ROUTE */}
<Route path="/settings" element={<Settings />} />
<Route path="/login" element={<Login />} />
<Route path="/register" element={<Register />} />
<Route path="/review/:id" element={<ReviewPage/>} />
<Route path="/map-search" element={<MapSearch />} />
<Route path="/admin" element={<AdminPanel />} />
<Route path="/verify-otp" element={<VerifyOtp/>} />
<Route path="/servicepage" element={<ServicePage/>} />
<Route path="/promote" element={<PromoteService />} />

{/* PROTECTED ROUTES */}

<Route
path="/booking"
element={
<ProtectedRoute>
<Booking />
</ProtectedRoute>
}
/>

<Route
path="/dashboard"
element={
<ProtectedRoute>
<Dashboard />
</ProtectedRoute>
}
/>

<Route
path="/mybookings"
element={
<ProtectedRoute>
<MyBookings />
</ProtectedRoute>
}
/>

<Route
path="/profile"
element={
<ProtectedRoute>
<Profile />
</ProtectedRoute>
}
/>

<Route
path="/chat"
element={
<ProtectedRoute>
<Chat />
</ProtectedRoute>
}
/>

<Route
path="/chat-list"
element={
<ProtectedRoute>
<ChatList />
</ProtectedRoute>
}
/>

<Route
path="/create-service"
element={
<ProtectedRoute>
<CreateService />
</ProtectedRoute>
}
/>

<Route
path="/edit-service/:id"
element={
<ProtectedRoute>
<EditService />
</ProtectedRoute>
}
/>


<Route
path="/admin"
element={
<ProtectedRoute adminOnly={true}>
<AdminPanel/>
</ProtectedRoute>
}
/>

<Route
path="/service-form"
element={
<ProtectedRoute>
<ServiceForm />
</ProtectedRoute>
}
/>

{/* OTHER */}

<Route path="/payment" element={<Payment />} />
<Route path="/booking-success" element={<BookingSuccess />} />

{/* ADMIN PANEL */}

<Route path="/admin" element={<AdminPanel />} />

{/* 404 */}

<Route path="*" element={<h2 style={{ padding: 40 }}>Page Not Found</h2>} />

</Routes>

{/* MOBILE NAVIGATION */}

{!hideMobileNav && <MobileBottomNav />}

</>
);
}