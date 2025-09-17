import { useEffect, useState } from "react";

export function useAdminNotifications(companyId) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!companyId) return;

    // 1. Fetch existing notifications from DB
    async function fetchExisting() {
      try {
        const res = await fetch(`/api/notifications/company/${companyId}`);
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch company notifications:", err);
      }
    }

    fetchExisting();

    // 2. Subscribe to real-time updates via Upstash
    const url = `${process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_URL}/subscribe/company-${companyId}?token=${process.env.NEXT_PUBLIC_UPSTASH_REDIS_REST_TOKEN}`;

    const es = new EventSource(url);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
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
  }, [companyId]);

  return notifications;
}
