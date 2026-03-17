import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signup } from "../store/auth/authSlice";
import { Link } from "react-router";
import LoadingScreen from "../components/LoadingScreen";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const Signup = () => {
  useDocumentTitle("Sign Up");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user", // default to user (bidder/seller)
  });
  const [isError, setIsError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(signup(formData)).unwrap();
      navigate("/");
    } catch (error) {
      console.log("Signup Failed", error);
      setIsError(error || "something went wrong");
      setTimeout(() => {
        setIsError("");
      }, 10000);
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-[#8d6f31] to-[#6a542f] bg-clip-text text-transparent">
            Create an account
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Join the auction community
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#d7c9ab] shadow-lg p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-white border border-[#d7c9ab] rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8d6f31]/40 focus:border-[#8d6f31] transition"
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Account Type
              </label>
              <div className="flex gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={formData.role === "user"}
                    onChange={() => setFormData({ ...formData, role: "user" })}
                    className="form-radio text-[#8d6f31] focus:ring-[#8d6f31]"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Bidder/Seller
                  </span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={formData.role === "admin"}
                    onChange={() => setFormData({ ...formData, role: "admin" })}
                    className="form-radio text-[#8d6f31] focus:ring-[#8d6f31]"
                  />
                  <span className="ml-2 text-sm text-gray-700">Admin</span>
                </label>
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-white border border-[#d7c9ab] rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8d6f31]/40 focus:border-[#8d6f31] transition"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-white border border-[#d7c9ab] rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8d6f31]/40 focus:border-[#8d6f31] transition"
                placeholder="••••••••"
                required
                minLength={8}
              />
              <p className="mt-1.5 text-xs text-gray-400">
                At least 8 characters
              </p>
            </div>

            {isError && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                {isError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8d6f31] text-white py-2.5 rounded-xl font-semibold hover:bg-[#6a542f] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#8d6f31] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-[#8d6f31]/20"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#8d6f31] font-medium hover:text-[#6a542f]"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
