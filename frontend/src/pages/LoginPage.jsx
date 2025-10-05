import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import AuthImagePattern from "../components/AuthImagePattern";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare } from "lucide-react";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberCredentials, setRememberCredentials] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { login, isLoggingIn } = useAuthStore();

  // Cargar credenciales guardadas al montar el componente
  useEffect(() => {
    const savedCredentials = localStorage.getItem('rememberedCredentials');
    if (savedCredentials) {
      const { email, password } = JSON.parse(savedCredentials);
      setFormData({ email, password });
      setRememberCredentials(true);
    }
  }, []);

  // Forzar que no haya scroll en esta página
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Guardar credenciales si está marcado "recordar"
    if (rememberCredentials) {
      localStorage.setItem('rememberedCredentials', JSON.stringify(formData));
    } else {
      localStorage.removeItem('rememberedCredentials');
    }
    
    login(formData);
  };

  return (
    <div className="max-h-screen grid lg:grid-cols-2 overflow-hidden">
      {/* Left Side - Form */}
      <div className="flex flex-col justify-center items-center p-4 sm:p-6 min-h-screen overflow-hidden">
        <div className="w-full max-w-md space-y-4">
          {/* Logo */}
          <div className="text-center mb-4">
            <div className="flex flex-col items-center gap-1 group">
              <div
                className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20
              transition-colors"
              >
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-xl font-bold mt-1">Welcome Back</h1>
              <p className="text-sm text-base-content/60">Sign in to your account</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  className={`input input-bordered w-full pl-10`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-10`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-base-content/40" />
                  ) : (
                    <Eye className="h-5 w-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Credentials Checkbox */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary checkbox-sm"
                  checked={rememberCredentials}
                  onChange={(e) => setRememberCredentials(e.target.checked)}
                />
                <span className="label-text text-sm">Remember my credentials</span>
              </label>
            </div>

            {/* Load Last Credentials Button */}
            {!rememberCredentials && localStorage.getItem('rememberedCredentials') && (
              <div className="text-center">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm text-primary"
                  onClick={() => {
                    const savedCredentials = localStorage.getItem('rememberedCredentials');
                    if (savedCredentials) {
                      const { email, password } = JSON.parse(savedCredentials);
                      setFormData({ email, password });
                      setRememberCredentials(true);
                    }
                  }}
                >
                  Load last used credentials
                </button>
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={isLoggingIn}>
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content/60">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="link link-primary">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Pattern */}
      <AuthImagePattern
        title={""}
        subtitle={""}
      />
    </div>
  );
};
export default LoginPage;
