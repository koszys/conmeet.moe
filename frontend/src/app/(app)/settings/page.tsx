import { RequireAuth } from '@/features/auth';
import { AccountSettingsContent } from './_components/AccountSettingsContent';

export default function SettingsPage() {
  return (
    <RequireAuth>
      <AccountSettingsContent />
    </RequireAuth>
  );
}
