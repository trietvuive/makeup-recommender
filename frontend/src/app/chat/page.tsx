import AppShell from "@/components/AppShell/AppShell";
import ChatTab from "@/components/ChatTab/ChatTab";

export default function ChatPage() {
  return (
    <AppShell active="chat">
      <ChatTab />
    </AppShell>
  );
}
