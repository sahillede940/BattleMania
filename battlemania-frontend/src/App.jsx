import React, { createContext, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import { Outlet, Navigate } from "react-router-dom";
import "./App.scss";
// import toast container
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { connectSocket, getSocket } from "./services/socket";
import Room from "./pages/Room/Room";



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
