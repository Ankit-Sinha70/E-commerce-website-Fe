import { Button } from "@/components/ui/button";
import { Bell, Menu, User, X, MessageSquare, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Sidebar from "../../component/Sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../features/auth/authSlice";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { accessToken, user } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {

    if ((!accessToken || !user || user.role !== 'admin') && location.pathname !== "/login") {
      Swal.fire(
        "Access Denied",
        "Only admins can access the dashboard.",
        "error"
      ).then(() => {
        navigate("/login");
      });
    }
    // Default to /admin/dashboard if accessing /admin
    if (location.pathname === "/admin" || location.pathname === "/admin/") {
      navigate("/admin/dashboard");
    }
  }, [navigate, location.pathname]);

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const performLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setShowLogoutDialog(false);
      toast.success("Logged Out!", {
        description: "You have been successfully logged out.",
      });
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      setShowLogoutDialog(false);
      toast.error("Logout Failed", {
        description: error.message || "An unexpected error occurred during logout.",
      });
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      navigate("/");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Content Area (Navbar + Outlet) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-sky-400 text-slate-50 p-4 sticky top-0 shadow-md flex justify-between items-center z-10">
          <div className="flex items-center">
            {/* Mobile menu toggle button */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-white mr-4 p-2 focus:outline-none focus:ring-2 focus:ring-white rounded"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            {/* "E-Commerce Admin" title removed from here */}
          </div>
          <div className="flex items-center space-x-4">
            <Bell className="h-6 w-6 cursor-pointer" />
            <div className="flex items-center space-x-2 bg-sky-300 hover:bg-sky-500 px-3 py-2 rounded-full">
              <User className="h-5 w-5" />
              <span className="text-sm hidden md:block">Admin User</span>
            </div>
            <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
              <DialogTrigger asChild>
                <Button
                  onClick={handleLogout}
                  className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-2 rounded"
                >
                  Log Out
                </Button>
              </DialogTrigger>
              <DialogContent className="w-96">
                <DialogHeader>
                  <DialogTitle>Confirm Logout</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to log out from the admin dashboard?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={performLogout} className="bg-red-500 hover:bg-red-600">
                    Yes, Log Out
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Page Content - This is the only part that will scroll */}
        <main className="flex-1 p-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
