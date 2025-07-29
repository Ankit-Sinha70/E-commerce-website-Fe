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
            <BellRing className="h-5 w-5 text-blue-600" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-xs">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80 max-h-96 overflow-y-auto"
        align="end"
      >
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="px-0">Notifications</DropdownMenuLabel>
          {notifications?.length > 0 && (
            <Link
              to="/user/notifications"
              className="text-xs text-blue-600 hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            >
              View All
            </Link>
          )}
        </div>
        <DropdownMenuSeparator />

        {loading ? (
          <DropdownMenuItem className="flex justify-center items-center text-sm text-gray-600">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </DropdownMenuItem>
        ) : notifications?.length > 0 ? (
          <>
            {notifications?.map((notification) => (
              <div
                key={notification._id}
                className="flex flex-col p-2 cursor-pointer"
              >
                <DropdownMenuItem
                  className={`flex items-start gap-2 px-3 py-2.5 rounded-md transition cursor-pointer ${
                    !notification.isRead
                      ? "bg-blue-50 hover:bg-blue-100"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex-grow">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>

                  {/* <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 flex-shrink-0 text-gray-400 hover:text-red-500 hover:bg-transparent"
                    onClick={(e) => handleDelete(e, notification._id)}
                    aria-label="Delete notification"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button> */}
                </DropdownMenuItem>
              </div>
            ))}

            {notifications?.length > 0 && (
              <div className="text-center py-2">
                <Link
                  to="/user/notifications"
                  className="text-xs text-blue-600 hover:underline"
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
              className="text-xs text-blue-600 hover:underline mt-1 inline-block"
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
