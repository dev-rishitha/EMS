// ems-client/src/components/Auth/Login.jsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const API_BASE = "http://localhost:8000/api";


function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        setError("Invalid email or password");
        return;
      }

      const data = await res.json(); // { id, name, email, role }
      login(data); // save user in AuthContext

      if (data.role === "admin") {
        navigate("/admin");
      } else if (data.role === "employee") {
        navigate("/employee");
      } else {
        setError("Unknown user role");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

    // if (email === "admin@gmail.com" && password === "123456") {
    //   login({
    //     role: "admin",
    //     email,
    //     name: "Admin User"
    //   });
    //   navigate("/admin");
    // } else if (email === "employee@gmail.com" && password === "123456") {
    //   login({
    //     role: "employee",
    //     email,
    //     name: "Employee User"
    //   });
    //   navigate("/employee");
    // } else {
    //   setError("Invalid email or password");
    // }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        {/* Brand */}
        <div className="mb-6 text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-semibold mb-2">
            EMS
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            EMS Login
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Sign in to manage employees and tasks.
          </p>
        </div>

        {error && (
          <p className="mb-3 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Login
          </button>
          <p className="text-[11px] text-gray-400 text-center mt-2 space-y-1">
            <span className="block">
              Admin: admin@gmail.com / 123456 · Employee: employee@gmail.com / 123456
            </span>
            <span className="block">
              Don’t have an account?{" "}
              <Link to="/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
