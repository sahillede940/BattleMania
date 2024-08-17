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
    <div>
      <h1>Register</h1>
      <form onSubmit={registerUser}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          placeholder="User Name"
        />
        <br />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
        />
        <br />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
        />
        <br />
        <input type="submit" value="Register" />
        <Link to="/login">Login</Link>
      </form>
    </div>
  );
}

export default App;
