import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleDéconnexion = async () => {
    await logout();
    navigate("/");
  };

  const handleConnexion = () => {
    // If on a protected page, redirect to login with return URL
    const currentPath = location.pathname;
    if (currentPath === "/set-limits" || currentPath === "/my-limits") {
      navigate(`/login?returnUrl=${encodeURIComponent(currentPath)}`);
    } else {
      navigate("/login");
    }
  };

  const isActive = (path) => location.pathname === path;
  const isConnexionPage = location.pathname === "/login";

  // All navigation links (always visible)
  const navLinks = [
    { path: "/", label: "Accueil" },
    { path: "/set-limits", label: "Définir mes limites" },
    { path: "/my-limits", label: "Mes limites" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-50 w-full">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-3 items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-lg sm:text-xl font-bold text-primary-600">
                Jeu responsable
              </h1>
            </div>

            <nav className="hidden md:flex space-x-4 justify-center">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? "bg-primary-100 text-primary-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center space-x-4 justify-end">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600">
                    {user?.mobile_number}
                  </span>
                  <button
                    onClick={handleDéconnexion}
                    className="btn-secondary text-sm"
                  >
                    Déconnexion
                  </button>
                </>
              ) : (
                !isConnexionPage && (
                  <button onClick={handleConnexion} className="btn-primary text-sm">
                    Connexion
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-3 rounded-md text-base font-medium transition-colors ${
                    isActive(link.path)
                      ? "bg-primary-100 text-primary-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {isAuthenticated && (
                <div className="pt-3 border-t border-gray-200 mt-3">
                  <p className="px-3 py-2 text-sm text-gray-600">
                    {user?.mobile_number}
                  </p>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleDéconnexion();
                    }}
                    className="w-full text-left px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    Déconnexion
                  </button>
                </div>
              )}
              {!isAuthenticated && !isConnexionPage && (
                <div className="pt-3 border-t border-gray-200 mt-3">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleConnexion();
                    }}
                    className="w-full text-left px-3 py-3 rounded-md text-base font-medium btn-primary"
                  >
                    Connexion
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
