// File: src/pages/MessagesPage.jsx
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  Trash2,
  Eye,
  MailOpen,
  MessageSquareOff,
  Mail,
  Phone,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL = import.meta.env.VITE_API_URL;

const MessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, you would fetch from API here:
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      Swal.fire("Access Denied", "You must login to view messages.", "error");
      setLoading(false);
      return;
    }
    fetch(`${API_URL}/api/messages`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then(setMessages)
      .catch((err) => console.error("Failed to fetch messages", err))
      .finally(() => setLoading(false));
  }, []);

  const handleViewMessage = (messageId) => {
    const message = messages.find((msg) => msg._id === messageId);
    if (message) {
      Swal.fire({
        title: message.subject,
        html: `
          <div class="text-left space-y-2 text-slate-300">
            <p><strong>From:</strong> ${message.name}</p>
            <p><strong>Email:</strong> ${message.email}</p>
            <p><strong>Phone:</strong> ${message.phone}</p>
            <p><strong>Date:</strong> ${new Date(
              message.createdAt
            ).toLocaleDateString()}</p>
            <hr class="my-3 border-gray-700">
            <p><strong>Message:</strong></p>
            <p class="text-gray-500">${message.message}</p>
          </div>
        `,
        background: "#334155",
        width: "90%",
        maxWidth: "600px",
        showCloseButton: true,
        confirmButtonText: "Close",
        confirmButtonColor: "#4f46e5",
      });

      // Mark as read if not already
      if (!message.isRead) {
        // Optimistically update the UI
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, isRead: true } : msg
          )
        );

        // Make API request to mark as read
        const accessToken = localStorage.getItem("accessToken");
        fetch(`${API_URL}/api/messages/${messageId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isRead: true }),
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error("Failed to mark message as read");
            }
          })
          .catch((err) => {
            console.error("Failed to mark as read", err);
            // Revert the UI update on error
            setMessages((prev) =>
              prev.map((msg) =>
                msg._id === messageId ? { ...msg, isRead: false } : msg
              )
            );
            Swal.fire(
              "Error",
              "Failed to mark message as read. Please try again.",
              "error"
            );
          });
      }
    }
  };

  const handleDeleteMessage = (messageId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      background: "#334155",
      color: "#fff",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        // In a real app, send DELETE request to API:
        const accessToken = localStorage.getItem("accessToken");
        fetch(`${API_URL}/api/messages/${messageId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        })
          .then((res) => {
            if (res.ok) {
              Swal.fire("Deleted!", "Message has been deleted.", "success");
              setMessages((prev) =>
                prev.filter((msg) => msg._id !== messageId)
              );
            } else {
              throw new Error("Failed to delete message");
            }
          })
          .catch((err) => Swal.fire("Error", err.message, "error"));
      }
    });
  };

  return (
    <div className="bg-[#0f172a] text-slate-300 min-h-screen">
      <div className="max-w-7xl mx-auto bg-[#1e293b] rounded-lg shadow-xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-700">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Messages
          </h2>
          <p className="text-gray-500 mt-1">
            Manage customer inquiries and feedback
          </p>
        </div>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500 text-lg">Loading messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <MessageSquareOff className="h-16 w-16 mb-4 text-gray-400" />
              <p className="text-xl font-semibold mb-2">No messages found</p>
              <p className="text-md text-center">
                There are currently no customer inquiries.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-700 shadow-xl">
                <table className="min-w-full bg-gray-800">
                  <thead>
                    <tr className="bg-gray-700 text-white text-left">
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Phone</th>
                      <th className="px-4 py-3 font-medium">Subject</th>
                      <th className="px-4 py-3 font-medium">Message</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((msg) => (
                      <tr
                        key={msg._id}
                        className={`border-b border-gray-700 last:border-b-0 hover:bg-gray-700 ${
                          !msg.isRead ? "bg-blue-900/10" : ""
                        }`}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-white">
                          <div className="flex items-center">
                            {!msg.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            )}
                            {msg.name}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {msg.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {msg.phone}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-white">
                          {msg.subject}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400 max-w-xs truncate">
                          {msg.message}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-500 hover:text-blue-400 hover:bg-blue-900/20 shadow-md"
                              onClick={() => handleViewMessage(msg._id)}
                              title="View message"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-400 hover:bg-red-900/20 shadow-md"
                              onClick={() => handleDeleteMessage(msg._id)}
                              title="Delete message"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-xl ${
                      !msg.isRead ? "border-blue-500 bg-blue-900/10" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        {!msg.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-1"></div>
                        )}
                        <div>
                          <h3 className="font-semibold text-white text-lg">
                            {msg.subject}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-500 hover:text-blue-400 hover:bg-blue-900/20 shadow-md"
                          onClick={() => handleViewMessage(msg._id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-400 hover:bg-red-900/20 shadow-md"
                          onClick={() => handleDeleteMessage(msg._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-medium">{msg.name}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{msg.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{msg.phone}</span>
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-md p-3">
                      <p className="text-sm text-gray-400 line-clamp-3">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Messages Summary */}
              <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className="text-sm text-gray-500">
                    Total: {messages.length} messages
                  </p>
                  <p className="text-sm text-gray-500">
                    Unread: {messages.filter((msg) => !msg.isRead).length}{" "}
                    messages
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
