import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../constants";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function App() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const registerUser = async (event) => {
    event.preventDefault();

    toast.loading("Loading...");

    try {
      const response = await axios.post(API_URL + "/api/auth/register", {
        username,
        email,
        password,
      });
      if (response.data.user) {
        toast.dismiss();
        toast.success("Registration successful");
        navigate("/login");
      } else {
        toast.dismiss();
        toast.error("Invalid credentials");
      }
    } catch (error) {
      toast.dismiss();
      alert("An error occurred");
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">Register</h1>
      <form className="auth-form" onSubmit={registerUser}>
        <div className="input-group">
          <input
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            placeholder="User Name"
          />
        </div>
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
          <input className="submit-button" type="submit" value="Register" />
        </div>
        <Link className="register-link" to="/login">
          Login
        </Link>
      </form>
    </div>
  );
}

export default App;
