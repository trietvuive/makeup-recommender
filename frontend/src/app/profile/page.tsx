import AppShell from "@/components/AppShell/AppShell";
import ProfileTab from "@/components/ProfileTab/ProfileTab";

export default function ProfilePage() {
  return (
    <AppShell active="profile">
      <ProfileTab />
    </AppShell>
  );
}
