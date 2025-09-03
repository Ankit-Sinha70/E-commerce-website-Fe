import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, Trash2, Loader2, BellRing } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

import { Link, useNavigate } from "react-router-dom";
import {
  fetchNotifications,
  markNotificationAsRead,
} from "@/features/notification/notificationSlice";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { Loader } from "@/component/common/Loader";

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  console.log("user", user);
  const { notifications, unreadCount, loading } = useSelector(
    (state) => state.notifications
  );

  // Mark notification as read
  const handleMarkAsRead = (id) => {
    dispatch(markNotificationAsRead(id));
  };

  // Delete notification
  // const handleDelete = (e, id) => {
  //   e.stopPropagation();
  //   dispatch(deleteUserNotification(id));
  // };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
    setIsOpen(false);
    navigate(`/user/notifications`);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        asChild
        onClick={() => user?._id && dispatch(fetchNotifications(user._id))}
      >
        <Button variant="ghost" size="icon" className="relative">
          {unreadCount > 0 ? (
            <BellRing className="h-12 w-12 text-red-600" />
          ) : (
            <Bell className="h-7 w-7" />
          )}
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-gray-400  text-white text-xs">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto bg-gray-800 border border-gray-700 rounded-md shadow-lg text-slate-300 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]" align="end">
        <div className="flex items-center justify-between px-3 py-2">
          <DropdownMenuLabel className="text-sm font-bold text-slate-300">Notifications</DropdownMenuLabel>
          {notifications?.length > 0 && (
            <Link
              to="/user/notifications"
              className="text-xs text-blue-500 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            >
              View All
            </Link>
          )}
        </div>
        <DropdownMenuSeparator className="bg-gray-700" />

        {loading ? (
          <DropdownMenuItem className="flex justify-center items-center text-sm text-gray-300">
            <Loader message={"Loading..."} className="mr-2 h-4 w-4 animate-spin text-blue-500" />
          </DropdownMenuItem>
        ) : notifications?.length > 0 ? (
          <>
            <div className="px-2 py-1 space-y-2">
              {notifications?.map((notification) => (
                <DropdownMenuItem
                  key={notification._id}
                  className={`flex items-start gap-3 px-4 py-3 rounded-md transition duration-200 cursor-pointer hover:shadow-sm ${
                    !notification.isRead
                      ? "bg-gray-600/60 hover:bg-gray-600"
                      : "hover:bg-gray-700/60"
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex-grow">
                    <p className="font-medium text-sm text-slate-300">{notification.title}</p>
                    <p className="text-xs text-gray-300 mt-1 line-clamp-2">{notification.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>

            {notifications?.length > 0 && (
              <div className="text-center py-2">
                <Link
                  to="/user/notifications"
                  className="text-xs text-blue-500 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  View all {notifications?.length} notifications
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="py-3 text-center">
            <p className="text-sm text-gray-500">No new notifications.</p>
            <Link
              to="/user/notifications"
              className="text-xs text-blue-500 hover:underline mt-1 inline-block"
              onClick={(e) => e.stopPropagation()}
            >
              View notification history
            </Link>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
