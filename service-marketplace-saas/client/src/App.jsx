import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Navbar from "./components/layout/Navbar";
import MobileBottomNav from "./components/layout/MobileBottomNav";
import PageWrapper from "./components/PageWrapper";
import Sidebar from "./components/layout/Sidebar";
/* Pages */
import AdminPanel from "./pages/AdminPanel";
import Home from "./pages/Home";
import Services from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetail";
import SellerProfile from "./pages/SellerProfile";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Booking from "./pages/Booking";
import CreateService from "./pages/CreateService";
import Chat from "./pages/Chat";
import BookingSuccess from "./pages/BookingSuccess";
import MyBookings from "./pages/MyBookings";
import EditService from "./pages/EditService";
import ServiceForm from "./pages/ServiceForm";
import ReviewPage from "./pages/ReviewPage";
import Settings from "./pages/Settings";
import ServicePage from "./pages/ServicePage";
/* Components */
import ChatList from "./pages/ChatList";
import ChatBot from "./components/ChatBot";
import ChatBot from "./components/ChatItem";
import ChatBot from "./components/MessageBubble";
import ProtectedRoute from "./components/ProtectedRoute";
import ServicesPage from "./pages/ServicePage";
import NearMeServices from "./components/NearMeServices";
import PromoteService from "./components/PromoteService";

function Layout(){

const location = useLocation();

/* PAGES WHERE NAVBAR SHOULD NOT SHOW */

const hideNavbarRoutes = [
"/login",
"/register",
"/dashboard",
"/admin",
"/booking",
"/chat",
"/chatlist",
"/mybookings",
"/createservice",
"/service-form"
];

const hideNavbar =
hideNavbarRoutes.includes(location.pathname) ||
location.pathname.startsWith("/edit-service");

return(

<>

{/* NAVBAR */}

{!hideNavbar && <Navbar />}

{/* ROUTES */}

<AnimatePresence mode="wait">

<Routes location={location} key={location.pathname}>

{/* PUBLIC ROUTES */}

<Route path="/" element={<PageWrapper><Home/></PageWrapper>} />
<Route path="/promote" element={<PromoteService />} />
<Route path="/services" element={<PageWrapper><Services/></PageWrapper>} />
<Route path="/servicepage" element={<PageWrapper><ServicePage/></PageWrapper>} />

<Route path="/service/:id" element={<PageWrapper><ServiceDetails/></PageWrapper>} />

<Route path="/seller/:id" element={<PageWrapper><SellerProfile/></PageWrapper>} />

<Route path="/login" element={<PageWrapper><Login/></PageWrapper>} />

<Route path="/register" element={<PageWrapper><Register/></PageWrapper>} />

<Route path="/review/:id" element={<ReviewPage/>} />
<Route path="/near" element={<NearMeServices />} />

{/* ✅ NEW SETTINGS ROUTE */}
<Route path="/settings" element={<Settings />} />
{/* ADMIN PANEL */}

<Route path="/admin" element={<AdminPanel />} />

{/* PROTECTED ROUTES */}

<Route
path="/booking"
element={
<ProtectedRoute>
<PageWrapper><Booking/></PageWrapper>
</ProtectedRoute>
}
/>

<Route
path="/booking-success"
element={
<ProtectedRoute>
<PageWrapper><BookingSuccess/></PageWrapper>
</ProtectedRoute>
}
/>

<Route
path="/dashboard"
element={
<ProtectedRoute>
<Dashboard/>
</ProtectedRoute>
}
/>

<Route
path="/chat"
element={
<ProtectedRoute>
<PageWrapper><Chat/></PageWrapper>
</ProtectedRoute>
}
/>

<Route
path="/chatlist"
element={
<ProtectedRoute>
<PageWrapper><ChatList/></PageWrapper>
</ProtectedRoute>
}
/>

<Route
path="/mybookings"
element={
<ProtectedRoute>
<PageWrapper><MyBookings/></PageWrapper>
</ProtectedRoute>
}
/>

<Route
path="/createservice"
element={
<ProtectedRoute>
<CreateService/>
</ProtectedRoute>
}
/>

<Route
path="/edit-service/:id"
element={
<ProtectedRoute>
<EditService/>
</ProtectedRoute>
}
/>

<Route
path="/service-form"
element={
<ProtectedRoute>
<ServiceForm/>
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

{/* 404 */}

<Route path="*" element={<h2 style={{padding:40}}>Page Not Found</h2>} />

</Routes>

</AnimatePresence>

{/* MOBILE NAV */}

{!hideNavbar && <MobileBottomNav />}

</>

);

}

export default function App(){

return(

<BrowserRouter>

<Layout/>

<ChatBot/>

</BrowserRouter>

);

}