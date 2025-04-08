import { useState, useEffect } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "../assets/eastland_logo.png";
import useAuth from "@/hooks/useAuth";
import useLogout from "@/hooks/useLogout";
import { useNavigate } from "react-router-dom";


const navItems = [
  { name: "Home", href: "/" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Verification", href: "/verification", roles: ["ADMIN"] },
  { name: "Validation", href: "/validation", roles: ["ADMIN"] },
  { name: "Profile", href: "/profile", roles: ["ADMIN"] },
];


export function ModernNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { auth } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const userRoles = auth?.roles || []; // Defaults to empty array
  const isAdmin = userRoles.includes("ADMIN"); // Check if user has ADMIN role
  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.some((role) => userRoles.includes(role))
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white shadow-md py-2" : "bg-transparent py-4"
        }`}
    >
      {/* container mx-auto px-4 */}
      {/* relative w-full px-4 */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 relative">
          {/* Left - Logo */}
          <div className="flex-shrink-0 z-10">
            <a href="/" className="flex items-center">
              <img src={logo} alt="nav-img" className="h-12 w-auto" />
            </a>
          </div>

          {/* Center - Navigation Items */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex space-x-8">
              {filteredNavItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-gray-800 hover:text-primary transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          {/* Right - Logout Button */}
          {!auth?.accessToken ? <div className="hidden lg:block">
            <Button onClick={() => navigate("/login")}>Login</Button>
          </div> : <div className="hidden lg:block">
            <Button onClick={handleLogout}>Logout</Button>
          </div>}



          {/* Mobile Menu */}
          <div className="lg:hidden flex-shrink-0 z-10">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-4">
                  {filteredNavItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="text-lg font-medium text-gray-700 hover:text-primary transition-colors"
                    >
                      {item.name}
                    </a>
                  ))}
                  <Button onClick={handleLogout} className="mt-4">Logout</Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
