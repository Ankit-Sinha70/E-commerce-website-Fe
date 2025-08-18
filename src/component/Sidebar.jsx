import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  MessageSquare,
  UserCog,
  Users,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Ban,
} from "lucide-react";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navLinks = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Manage Products",
      path: "/admin/manage-products",
      icon: <Boxes className="h-5 w-5" />,
    },
    {
      name: "Manage Orders",
      path: "/admin/orders",
      icon: <ShoppingCart className="h-5 w-5" />,
    },
    // {
    //   name: "Manage Messages",
    //   path: "/admin/messages",
    //   icon: <MessageSquare className="h-5 w-5" />,
    // },
    {
      name: "Manage Categories",
      path: "/admin/manage-categories",
      icon: <UserCog className="h-5 w-5" />,
    },
    {
      name: "Manage Users",
      path: "/admin/manage-users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Manage Return Requests",
      path: "/admin/manage-return-requests",
      icon: <RotateCcw className="h-5 w-5" />,
    },
    {
      name: "Cancelled Orders",
      path: "/admin/cancelled-orders",
      icon: <Ban className="h-5 w-5" />,
    },
  ];

  const getLinkClass = (path) => {
    return location.pathname.startsWith(path)
      ? "bg-[#475569] font-semibold hover:border-l-4 hover:border-white"
      : "hover:bg-[#334155] hover:shadow-md hover:scale-[1.02]";
  };

  return (
    <>
      <aside
        className={`${
          isCollapsed ? "w-20" : "w-64"
        } bg-[#1e293b] text-slate-50 p-4 shadow-xl lg:shadow-md
          transition-all duration-300 ease-in-out z-20
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          fixed top-0 left-0 h-screen overflow-y-auto
          lg:static lg:translate-x-0 lg:h-full lg:flex-shrink-0`}
      >
        {/* Toggle Collapse Button */}
        <div className="flex justify-between items-center mb-6">
          {!isCollapsed && (
            <h3 className="text-xl font-bold">E-Commerce Admin</h3>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white hover:bg-[#334155] p-1 rounded"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav>
          <ul>
            {navLinks.map((link) => (
              <li key={link.name} className="mb-2">
                <Link
                  to={link.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 py-2 px-3 rounded transition duration-200
                    ${getLinkClass(link.path)}`}
                >
                  {link.icon}
                  {!isCollapsed && <span>{link.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/5 z-10 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
