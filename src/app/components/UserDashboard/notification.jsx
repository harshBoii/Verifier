"use client";

import { useNotifications } from "../../hook/useNotification";
import { useState } from "react";

export default function NotificationBell({ userId }) {
  const notifications = useNotifications(userId);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-200"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white border rounded shadow-lg z-10 max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-gray-500">No notifications</div>
          ) : (
            notifications.map((n, i) => (
              <div key={i} className="p-3 border-b">
                <div className="font-bold">{n.title}</div>
                <div className="text-sm text-gray-600">{n.message}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
