import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../constants";
import axios from "axios";
import { toast } from "react-toastify";
import { connectSocket } from "../../services/socket";
import "./Login.scss";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function loginUser(event) {
    event.preventDefault();
    toast.loading("Loading...");

    await axios
      .post(API_URL + "/api/auth/login", {
        email,
        password,
      })
      .then((response) => {
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
          toast.dismiss();
          toast.success("Login successful");
          connectSocket();
          navigate("/dashboard");
        } else {
          toast.dismiss();
          toast.error("Invalid credentials");
        }
      })
      .catch((error) => {
        toast.dismiss();
      });
  }

  return (
    <div className="auth-container">
      <h1 className="auth-title">Login</h1>
      <form className="auth-form" onSubmit={loginUser}>
        <div className="input-group">
          <input
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
          />
        </div>
        <div className="input-group">
          <input
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
          />
        </div>
        <div className="input-group">
          <input className="submit-button" type="submit" value="Login" />
        </div>
        <Link className="register-link" to="/register">
          Register
        </Link>
      </form>
    </div>
  );
}

export default App;
