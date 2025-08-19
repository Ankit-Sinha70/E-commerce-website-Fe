import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
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
    if (!user?._id) return;
    if (selectedNotifications.length === 0) return;

    // Single selection → call single delete API; Multi-selection → bulk delete API
    openConfirmationDialog(() => {
      let promise;
      if (selectedNotifications.length === 1) {
        promise = dispatch(deleteUserNotification(selectedNotifications[0])).unwrap();
      } else {
        promise = dispatch(
          deleteAllNotifications({ userId: user._id, notificationIds: selectedNotifications })
        ).unwrap();
      }

      toast.promise(
        promise,
        {
          pending: {
            render: selectedNotifications.length === 1
              ? 'Deleting notification...'
              : 'Deleting selected notifications...',
            className: 'toast-info',
          },
          success: {
            render: selectedNotifications.length === 1
              ? 'Notification deleted successfully!'
              : 'Selected notifications deleted successfully!',
            className: 'toast-success',
          },
          error: {
            render: selectedNotifications.length === 1
              ? 'Failed to delete notification.'
              : 'Failed to delete selected notifications.',
            className: 'toast-danger',
          },
        }
      );

      setSelectedNotifications([]);
    });
  };

  const handleMarkAllAsRead = () => {
    if (user?._id) {
      const promise = dispatch(markAllNotificationsAsRead(user._id)).unwrap();
      toast.promise(
        promise,
        {
          pending: { render: 'Marking all as read...', className: 'toast-info' },
          success: { render: 'All notifications marked as read!', className: 'toast-success' },
          error: { render: 'Failed to mark all as read.', className: 'toast-danger' },
        }
      ).then(() => {
        setSelectedNotifications([]);
      });
    }
  };

  const handleDeleteAll = () => {
    if (user?._id) {
      openConfirmationDialog(() => {
        const promise = dispatch(deleteAllNotifications({ userId: user._id })).unwrap();
        toast.promise(
          promise,
          {
            pending: { render: 'Deleting all notifications...', className: 'toast-info' },
            success: { render: 'All notifications deleted successfully!', className: 'toast-success' },
            error: { render: 'Failed to delete all notifications.', className: 'toast-danger' },
          }
        );
      });
    }
  };

  const handleDeleteSingle = (id) => {
    openConfirmationDialog(() => {
      const promise = dispatch(deleteUserNotification(id)).unwrap();
      toast.promise(
        promise,
        {
          pending: { render: 'Deleting notification...', className: 'toast-info' },
          success: { render: 'Notification deleted successfully!', className: 'toast-success' },
          error: { render: 'Failed to delete notification.', className: 'toast-danger' },
        }
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#111827] text-slate-300 py-20 sm:py-24">
      <div className="max-w-screen-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-4">Notifications</h2>
          <p className="text-base sm:text-lg text-slate-400">Stay up-to-date with the latest activity on your account.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 bg-gray-800 rounded-2xl border border-gray-700">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-slate-300">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          <Card className="bg-gray-800 border border-gray-700 rounded-2xl shadow-lg">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-4 border-b border-gray-700">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedNotifications.length === notifications.length}
                    onCheckedChange={handleSelectAll}
                    className="text-blue-500 focus:ring-blue-500"
                  />
                  <label htmlFor="select-all" className="text-sm font-medium text-slate-300 cursor-pointer">
                    Select All
                  </label>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={selectedNotifications.length === 0}
                    onClick={handleDeleteSelected}
                    className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto"
                  >
                    Delete Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="sm:ml-2 text-slate-300 w-full sm:w-auto"
                    disabled={selectedNotifications.length !== notifications.length}
                  >
                    Mark All as Read
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteAll}
                    disabled={selectedNotifications.length <= 1}
                    className="sm:ml-2 bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    Delete All
                  </Button>
                </div>
              </div>
              <div className="divide-y divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`flex flex-col sm:flex-row items-start sm:items-center p-4 gap-3 sm:gap-4 transition-colors ${!notification.isRead ? 'bg-gray-700' : 'bg-gray-800'} hover:bg-gray-700`}
                  >
                    <Checkbox
                      id={`select-${notification._id}`}
                      checked={selectedNotifications.includes(notification._id)}
                      onCheckedChange={() => handleSelect(notification._id)}
                      className="mt-1 text-blue-500 focus:ring-blue-500"
                    />
                    <div className="flex-grow cursor-pointer" onClick={() => handleSelect(notification._id)}>
                      <p className="font-semibold text-slate-300">{notification.title}</p>
                      <p className="text-sm text-gray-500 mt-1 break-words">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0 text-gray-500 hover:text-red-500 self-end sm:self-auto mt-2 sm:mt-0"
                      onClick={() => handleDeleteSingle(notification._id)}
                      aria-label="Delete notification"
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
          <AlertDialogContent className="bg-gray-800 border border-gray-700 rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-slate-300">
                <ShieldAlert className="h-6 w-6 text-red-500" />
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500">
                This action cannot be undone. This will permanently delete the selected notification(s).
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="text-slate-300">Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600 text-white"
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