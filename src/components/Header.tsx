import { Search, ShoppingCart, MessageCircle, Menu, X, User, LogOut, Store } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/contexts/AdminContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import NotificationBell from "./NotificationBell";
import SearchDropdown from "./SearchDropdown";

const navLinks = [
  { name: "Trang chủ", path: "/" },
  { name: "Sản phẩm", path: "/catalog" },
  { name: "Dịch vụ", path: "/services" },
  { name: "Hướng dẫn", path: "/guide" },
  { name: "Liên hệ", path: "/contact" },
];

const Header = () => {
  const { getTotalItems, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { isAdminLoggedIn, logoutAdmin } = useAdmin();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: 'Đã đăng xuất',
      description: 'Hẹn gặp lại bạn!',
    });
    navigate('/');
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 bg-background/80 backdrop-blur-md border-b border-border/50"
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <Link to="/">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-xl">🌿</span>
              </div>
              <span className="font-display text-2xl font-medium text-foreground">
                Verdant
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${location.pathname === link.path
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/70 hover:text-foreground hover:bg-muted"
                    }`}
                >
                  {link.name}
                </motion.span>
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <SearchDropdown variant="page" />
            
            <NotificationBell />

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCartOpen(true)}
              className="btn-icon relative"
            >
              <ShoppingCart className="w-5 h-5 text-foreground" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-xs flex items-center justify-center text-primary-foreground font-medium">
                  {getTotalItems()}
                </span>
              )}
            </motion.button>
            
            {/* Seller Center Button */}
            {isAuthenticated && user?.role === 'seller' && (
              <Link to="/seller">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-icon"
                  title="Seller Center"
                >
                  <Store className="w-5 h-5 text-foreground" />
                </motion.button>
              </Link>
            )}
            
            {/* User Account Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-icon flex items-center gap-2"
                >
                  <User className="w-5 h-5 text-foreground" />
                  {isAuthenticated && user?.name && (
                    <span className="hidden lg:inline text-sm font-medium text-foreground max-w-[100px] truncate">
                      {user.name.split(' ').pop()}
                    </span>
                  )}
                  {isAdminLoggedIn && (
                    <span className="hidden lg:inline text-sm font-medium text-foreground">
                      Admin
                    </span>
                  )}
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isAuthenticated ? (
                  <>
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/account')}>
                      <User className="w-4 h-4 mr-2" />
                      Tài khoản của tôi
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </>
                ) : isAdminLoggedIn ? (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      <Store className="w-4 h-4 mr-2" />
                      Trang admin
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        logoutAdmin();
                        toast({ title: "Đã đăng xuất Admin!" });
                        navigate("/");
                      }}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Đăng xuất Admin
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/login')}>
                      Đăng nhập
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/register')}>
                      Đăng ký
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/contact">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="btn-icon"
              >
                <MessageCircle className="w-5 h-5 text-foreground" />
              </motion.button>
            </Link>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="btn-icon md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-foreground" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[72px] left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border p-4 md:hidden"
          >
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.path
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground/70 hover:text-foreground hover:bg-muted"
                      }`}
                  >
                    {link.name}
                  </motion.div>
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
