import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { MoreVertical, Trash2, Check, MailCheck, X, Loader2, Bell, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  fetchNotifications,
  deleteUserNotification,
  markAllNotificationsAsRead,
  deleteAllNotifications,
} from "@/features/notification/notificationSlice";

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { notifications, loading } = useSelector((state) => state.notifications);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchNotifications(user._id));
    }
  }, [dispatch, user?._id]);

  const openConfirmationDialog = (action) => {
    setConfirmAction(() => action);
    setIsAlertOpen(true);
  };

  const handleSelect = (id) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map((n) => n._id));
    }
  };

  const handleDeleteSelected = () => {
    openConfirmationDialog(() => {
      const promise = dispatch(deleteAllNotifications({ userId: user._id, notificationIds: selectedNotifications })).unwrap();
      toast.promise(promise, {
        loading: 'Deleting selected notifications...',
        success: 'Selected notifications deleted successfully!',
        error: 'Failed to delete selected notifications.',
      });
      setSelectedNotifications([]);
    });
  };

  const handleMarkAllAsRead = () => {
    if (user?._id) {
      const promise = dispatch(markAllNotificationsAsRead(user._id)).unwrap();
      toast.promise(promise, {
        loading: 'Marking all as read...',
        success: 'All notifications marked as read!',
        error: 'Failed to mark all as read.',
      });
    }
  };

  const handleDeleteAll = () => {
    if (user?._id) {
      openConfirmationDialog(() => {
        const promise = dispatch(deleteAllNotifications({ userId: user._id })).unwrap();
        toast.promise(promise, {
          loading: 'Deleting all notifications...',
          success: 'All notifications deleted successfully!',
          error: 'Failed to delete all notifications.',
        });
      });
    }
  };

  const handleDeleteSingle = (id) => {
    openConfirmationDialog(() => {
      const promise = dispatch(deleteUserNotification(id)).unwrap();
      toast.promise(promise, {
        loading: 'Deleting notification...',
        success: 'Notification deleted successfully!',
        error: 'Failed to delete notification.',
      });
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen mt-16">
      <div className="max-w-8xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Notifications</h1>
          <div className="flex items-center gap-2">
            {selectedNotifications.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({selectedNotifications.length})
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSelectAll}>
                  <Check className="h-4 w-4 mr-2" />
                  {selectedNotifications.length === notifications.length ? "Deselect All" : "Select All"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleMarkAllAsRead}>
                  <MailCheck className="h-4 w-4 mr-2" />
                  Mark All as Read
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500 focus:text-red-600 focus:bg-red-50"
                  onClick={handleDeleteAll}
                >
                  <X className="h-4 w-4 mr-2" />
                  Delete All
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`flex items-start p-4 gap-4 transition-colors ${!notification.isRead ? 'bg-blue-50' : 'bg-white'} hover:bg-gray-100`}
                  >
                    <Checkbox
                      id={`select-${notification._id}`}
                      checked={selectedNotifications.includes(notification._id)}
                      onCheckedChange={() => handleSelect(notification._id)}
                      className="mt-1"
                    />
                    <div className="flex-grow cursor-pointer" onClick={() => handleSelect(notification._id)}>
                      <p className="font-semibold text-gray-800">{notification.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0 text-gray-400 hover:text-red-500"
                      onClick={() => handleDeleteSingle(notification._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <ShieldAlert className="h-6 w-6 text-red-500" />
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the selected notification(s).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={() => {
                  if (typeof confirmAction === 'function') {
                    confirmAction();
                  }
                  setIsAlertOpen(false);
                }}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </div>
  );
};

export default NotificationsPage;