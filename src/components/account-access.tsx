import { useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { accountClient } from "@/lib/account-client";
export function SignOutButton() {
  const client = useQueryClient();
  const router = useRouter();
  return <Button variant="outline" onClick={async () => {
    await client.cancelQueries(); client.clear();
    const result = await accountClient.signOut();
    if (result.error) return;
    await router.invalidate();
    await router.navigate({ to: "/auth", replace: true });
  }}><LogOut className="h-4 w-4" />Sign out</Button>;
}