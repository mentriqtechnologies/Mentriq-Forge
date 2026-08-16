import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const token = params.get("token");
    const user = params.get("user");

    if (token) {
      localStorage.setItem("forge_token", token);
    }

    if (user) {
      localStorage.setItem("forge_user", decodeURIComponent(user));

      const role = JSON.parse(decodeURIComponent(user)).role;

      if (role === "evaluator") {
        navigate("/evaluator/dashboard");
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "company") {
        navigate("/company/dashboard");
      } else {
        navigate("/candidate/dashboard");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  return <h2 className="text-center mt-10">Signing in...</h2>;
}