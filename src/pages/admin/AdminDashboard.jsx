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
import { toast } from "react-toastify";
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
    if (
      (!accessToken || !user || user.role !== "admin") &&
      location.pathname !== "/login"
    ) {
      Swal.fire(
        "Access Denied",
        "Only admins can access the dashboard.",
        "error"
      ).then(() => {
        navigate("/login");
      });
    }
    if (location.pathname === "/admin" || location.pathname === "/admin/") {
      navigate("/admin/dashboard");
    }
  }, [navigate, location.pathname, accessToken, user]);

  const performLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setShowLogoutDialog(false);
      toast.success(
        <div>
          <strong>Logged Out!</strong>
          <div style={{ fontSize: "14px" }}>
            You have been successfully logged out.
          </div>
        </div>,
        {
          className: "toast-success",
        }
      );

      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      setShowLogoutDialog(false);
      toast.error(
        <div>
          <strong>Logout Failed</strong>
          <div style={{ fontSize: "14px" }}>
            {error.message || "An unexpected error occurred during logout."}
          </div>
        </div>,
        {
          className: "toast-danger",
        }
      );
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#1e293b] text-slate-300 flex">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-[#1e293b] text-slate-50 p-4 sticky top-0 shadow-md z-10">
          <div className="flex justify-end items-center">
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

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              <Bell className="h-6 w-6 cursor-pointer" />
              <div className="flex items-center space-x-2 bg-[#1e293b] hover:bg-[#475569] px-3 py-2 rounded-full">
                <User className="h-5 w-5" />
                <span className="text-sm hidden md:block">Admin User</span>
              </div>

              {/* Logout Button with Dialog */}
              <Dialog
                open={showLogoutDialog}
                onOpenChange={setShowLogoutDialog}
              >
                <DialogTrigger asChild>
                  <Button className="bg-rose-500 hover:bg-rose-600 text-white px-3 py-2 rounded">
                    Log Out
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-96 bg-gray-800 text-slate-300">
                  <DialogHeader>
                    <DialogTitle>Confirm Logout</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to log out from the admin dashboard?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" className="text-gray-400">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      onClick={performLogout}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Yes, Log Out
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#1e293b] p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
