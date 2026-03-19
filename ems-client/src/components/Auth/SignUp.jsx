import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_BASE = "http://localhost:8000/api";

function SignUp() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password) {
      setError("Please fill all fields");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.status === 409) {
        setError("Email already registered");
        return;
      }

      if (!res.ok) {
        setError("Could not create account. Please try again.");
        return;
      }

      setSuccess("Account created successfully. You can now log in.");
      // Optionally auto-redirect after a short delay
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      console.error("Sign up error:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="mb-6 text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-semibold mb-2">
            EMS
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Employee Sign Up
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Create your employee account.
          </p>
        </div>

        {error && (
          <p className="mb-3 text-xs sm:text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {success && (
          <p className="mb-3 text-xs sm:text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              placeholder="Work email"
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
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Sign Up
          </button>

          <p className="text-[11px] text-gray-400 text-center mt-2">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
