import { Header } from "@/components/layout/header";
import { SettingsForm } from "@/components/settings/settings-form";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { getSettings } from "./actions";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <>
      <Header title="Settings" />
      <div className="p-6 max-w-2xl space-y-6">
        <SettingsForm settings={settings} />
        <ChangePasswordForm />
      </div>
    </>
  );
}
