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

  // Dummy Data for Messages (replace with actual API fetch later)
  // const dummyMessages = [
  //   {
  //     _id: "msg_001",
  //     name: "Alice Smith",
  //     email: "alice.s@example.com",
  //     phone: "123-456-7890",
  //     subject: "Inquiry about Bulk Order",
  //     message:
  //       "Hi, I'm interested in placing a large order for an upcoming event. Can you provide more details on bulk pricing?",
  //     createdAt: "2024-03-10T10:30:00Z",
  //     isRead: false,
  //   },
  //   {
  //     _id: "msg_002",
  //     name: "Bob Johnson",
  //     email: "bob.j@example.com",
  //     phone: "098-765-4321",
  //     subject: "Feedback on Ice Quality",
  //     message:
  //       "Just wanted to say your ice cubes are fantastic! Really clear and last a long time in drinks.",
  //     createdAt: "2024-03-09T14:00:00Z",
  //     isRead: true,
  //   },
  //   {
  //     _id: "msg_003",
  //     name: "Charlie Brown",
  //     email: "charlie.b@example.com",
  //     phone: "555-123-4567",
  //     subject: "Issue with recent delivery",
  //     message:
  //       "My recent order was delivered late and some bags were torn. Can you please look into this?",
  //     createdAt: "2024-03-08T09:15:00Z",
  //     isRead: false,
  //   },
  //   {
  //     _id: "msg_004",
  //     name: "Diana Prince",
  //     email: "diana.p@example.com",
  //     phone: "777-888-9999",
  //     subject: "Partnership Opportunity",
  //     message:
  //       "Our catering company is looking for a reliable ice supplier. Interested in discussing a partnership?",
  //     createdAt: "2024-03-07T16:45:00Z",
  //     isRead: true,
  //   },
  // ];

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

    // For dummy data, simulate loading
    setLoading(true);
    setTimeout(() => {
      // setMessages(dummyMessages);
      setLoading(false);
    }, 500);
  }, []);

  const handleViewMessage = (messageId) => {
    const message = messages.find((msg) => msg._id === messageId);
    if (message) {
      Swal.fire({
        title: message.subject,
        html: `
          <div class="text-left space-y-2">
            <p><strong>From:</strong> ${message.name}</p>
            <p><strong>Email:</strong> ${message.email}</p>
            <p><strong>Phone:</strong> ${message.phone}</p>
            <p><strong>Date:</strong> ${new Date(
              message.createdAt
            ).toLocaleDateString()}</p>
            <hr class="my-3">
            <p><strong>Message:</strong></p>
            <p class="text-gray-700">${message.message}</p>
          </div>
        `,
        width: "90%",
        maxWidth: "600px",
        showCloseButton: true,
        confirmButtonText: "Close",
      });

      // Mark as read if not already
      if (!message.isRead) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, isRead: true } : msg
          )
        );
      }
    }
  };

  const handleDeleteMessage = (messageId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        // In a real app, send DELETE request to API:
        const accessToken = localStorage.getItem('accessToken');
        fetch(`${API_URL}/api/messages/${messageId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then(res => {
          if (res.ok) {
            Swal.fire('Deleted!', 'Message has been deleted.', 'success');
            setMessages(messages.filter(msg => msg._id !== messageId)); 
          } else {
            throw new Error('Failed to delete message');
          }
        })
        .catch(err => Swal.fire('Error', err.message, 'error'));

        Swal.fire("Deleted!", "Message has been deleted.", "success");
        setMessages(messages.filter((msg) => msg._id !== messageId));
      }
    });
  };

  const handleMarkAsRead = (messageId) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg._id === messageId ? { ...msg, isRead: true } : msg
      )
    );
    Swal.fire("Success", "Message marked as read!", "success");
  };

  return (
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Messages
          </h2>
          <p className="text-gray-600 mt-1">
            Manage customer inquiries and feedback
          </p>
        </div>

        <div className="p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading messages...</p>
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
              <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 text-left">
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
                        className={`border-b last:border-b-0 hover:bg-gray-50 ${
                          !msg.isRead ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                          <div className="flex items-center">
                            {!msg.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            )}
                            {msg.name}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {msg.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {msg.phone}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                          {msg.subject}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 max-w-xs truncate">
                          {msg.message}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {new Date(msg.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-2"
                              onClick={() => handleViewMessage(msg._id)}
                              title="View message"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800 hover:bg-red-100 p-2"
                              onClick={() => handleDeleteMessage(msg._id)}
                              title="Delete message"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            {!msg.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-600 hover:text-green-800 hover:bg-green-100 p-2"
                                onClick={() => handleMarkAsRead(msg._id)}
                                title="Mark as read"
                              >
                                <MailOpen className="h-4 w-4" />
                              </Button>
                            )}
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
                    className={`bg-white border rounded-lg p-4 shadow-sm ${
                      !msg.isRead
                        ? "border-blue-200 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        {!msg.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-2"></div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {msg.subject}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 p-2"
                          onClick={() => handleViewMessage(msg._id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800 hover:bg-red-100 p-2"
                          onClick={() => handleDeleteMessage(msg._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {!msg.isRead && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-800 hover:bg-green-100 p-2"
                            onClick={() => handleMarkAsRead(msg._id)}
                          >
                            <MailOpen className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-medium">{msg.name}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{msg.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{msg.phone}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-md p-3">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Messages Summary */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className="text-sm text-gray-600">
                    Total: {messages.length} messages
                  </p>
                  <p className="text-sm text-gray-600">
                    Unread: {messages.filter((msg) => !msg.isRead).length}{" "}
                    messages
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
  );
};

export default MessagesPage;
