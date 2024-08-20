import React, { createContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import { Outlet, Navigate } from "react-router-dom";
import "./App.scss";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { connectSocket, getSocket } from "./services/socket";
import Room from "./pages/Room/Room";
import Profile from "./pages/Profile/Profile";
import LeaderBoard from "./pages/LeaderBoard.jsx/LeaderBoard";

const UserContext = createContext();

const PrivateRoutes = () => {
  let auth = localStorage.getItem("token");
  if (auth) {
    connectSocket();
  }
  return auth ? <Outlet /> : <Navigate to="/login" />;
};

const App = () => {
  const [isLoggedin, setIsLoggedin] = React.useState(false);
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedin(true);
    }
  }, []);

  return (
    <UserContext.Provider value={{ isLoggedin, setIsLoggedin }}>
      <Router>
        <ToastContainer />
        <Routes>
          <Route element={<PrivateRoutes />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/:roomId" element={<Room />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/leaderboard" element={<LeaderBoard />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
};

export default App;
