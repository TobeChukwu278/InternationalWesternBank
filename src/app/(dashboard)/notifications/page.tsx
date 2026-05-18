import { getNotifications } from "@/lib/actions/notifications";
import { NotificationList } from "./notification-list";

export default async function NotificationsPage() {
  const { notifications, total } = await getNotifications(50);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <NotificationList notifications={notifications} total={total} />
    </div>
  );
}
