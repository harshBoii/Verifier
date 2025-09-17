import { useEffect, useState } from "react";

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId) return;

    // 1. Fetch existing notifications from DB
    async function fetchExisting() {
      try {
        const res = await fetch(`/api/notifications/${userId}`);
        const data = await res.json();
        setNotifications(data); // initial state from DB
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    }

    fetchExisting();

    // 2. Subscribe to Upstash SSE for new notifications
    const url = `${process.env.UPSTASH_REDIS_REST_URL}/subscribe/notifications-${userId}?token=${process.env.UPSTASH_REDIS_REST_TOKEN}`;

    const es = new EventSource(url);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // prepend new notifications (avoid duplicates by checking ID)
        setNotifications((prev) => {
          if (prev.some((n) => n.id === data.id)) return prev;
          return [data, ...prev];
        });
      } catch (err) {
        console.error("Error parsing SSE notification:", err);
      }
    };

    es.onerror = (err) => {
      console.error("SSE error:", err);
      es.close();
    };

    return () => es.close();
  }, [userId]);

  return notifications;
}
