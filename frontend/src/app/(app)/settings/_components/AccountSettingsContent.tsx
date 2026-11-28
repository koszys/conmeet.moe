'use client';

import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { AtSign, Calendar, Camera, Check, Link2, Mail, RefreshCw, Unlink } from 'lucide-react';
import {
  useAuth,
  useStartProviderLink,
  useUnlinkProvider,
  useUpdateProfile,
} from '@/features/auth';
import { OAUTH_PROVIDERS } from '@/shared/components/brand/OAuthProviders';
import { SpinBackdrop } from '@/shared/components/miku';
import {
  Alert,
  Button,
  EditButton,
  FormActions,
  FormField,
  StatusBanner,
  TextInput,
  UserAvatar,
} from '@/shared/components/ui';
import { type OAuthProvider } from '@/shared/lib/api';
import { parseDate } from '@/shared/lib/dates';
import { parseApiFieldErrors } from '@/shared/lib/errors';
import { cn } from '@/shared/lib/utils';

export function AccountSettingsContent() {
  const { user, refreshUser, usernameCollisionNotice, dismissUsernameCollisionNotice } = useAuth();
  const updateMutation = useUpdateProfile();
  const unlinkMutation = useUnlinkProvider();
  const startLinkMutation = useStartProviderLink();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState(user?.username || '');
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isCollisionNotice, setIsCollisionNotice] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [providerMessage, setProviderMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [pendingProvider, setPendingProvider] = useState<OAuthProvider | null>(null);

  // Sync initial user data
  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setDisplayName(user.display_name || '');
    }
  }, [user]);

  // Check URL param or context for username collision warning or OAuth link results
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('username_collision') === '1' || usernameCollisionNotice) {
      setIsCollisionNotice(true);
      setIsEditing(true);
      setTimeout(() => usernameInputRef.current?.focus(), 0);
    }

    const linked = params.get('linked');
    const linkError = params.get('link_error');
    if (linked && OAUTH_PROVIDERS[linked]) {
      void refreshUser();
      setProviderMessage({
        type: 'success',
        text: `${OAUTH_PROVIDERS[linked].label} account linked successfully!`,
      });
      params.delete('linked');
      const nextSearch = params.toString();
      window.history.replaceState(
        {},
        '',
        `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}`
      );
    } else if (linkError) {
      const errorText =
        linkError === 'already_linked'
          ? 'That external account is already linked to another conmeet.moe account.'
          : linkError === 'cancelled'
            ? 'Account linking was cancelled.'
            : linkError === 'oauth_error'
              ? 'Account linking failed. Please try again.'
              : 'Your account linking session expired. Please try again.';
      setProviderMessage({ type: 'error', text: errorText });
      params.delete('link_error');
      const nextSearch = params.toString();
      window.history.replaceState(
        {},
        '',
        `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}`
      );
    }
  }, [usernameCollisionNotice, refreshUser]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFileError('Image file size must not exceed 5MB.');
      return;
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setFileError('Please select a valid image file (PNG, JPG, or WEBP).');
      return;
    }

    setFileError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormErrors({});
    setSuccessMessage(null);

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setFormErrors({ username: 'Username cannot be blank.' });
      return;
    }
    if (trimmedUsername.length > 20) {
      setFormErrors({ username: 'Username must be 20 characters or fewer.' });
      return;
    }

    const trimmedDisplayName = displayName.trim();
    if (trimmedDisplayName.length > 20) {
      setFormErrors({ display_name: 'Display name must be 20 characters or fewer.' });
      return;
    }

    const formData = new FormData();
    formData.append('username', trimmedUsername);
    formData.append('display_name', trimmedDisplayName);

    if (selectedFile) {
      formData.append('avatar', selectedFile);
    }

    try {
      await updateMutation.mutateAsync(formData);
      setSuccessMessage('Account profile updated successfully!');
      setIsEditing(false);
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setIsCollisionNotice(false);
      dismissUsernameCollisionNotice();

      // Clean up URL parameter if present
      if (window.location.search.includes('username_collision')) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch (err: unknown) {
      setFormErrors(await parseApiFieldErrors(err, 'Failed to update account. Please try again.'));
    }
  }

  function handleCancelEdit() {
    if (user) {
      setUsername(user.username);
      setDisplayName(user.display_name || '');
    }
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setFileError(null);
    setFormErrors({});
    setIsEditing(false);
  }

  async function handleLinkProvider(provider: OAuthProvider, mode: 'connect' | 'relink') {
    setProviderMessage(null);
    setPendingProvider(provider);
    try {
      const redirectUrl = await startLinkMutation.mutateAsync({
        provider,
        mode,
        next: '/settings',
      });
      window.location.assign(redirectUrl);
    } catch {
      setProviderMessage({
        type: 'error',
        text: `Failed to start ${OAUTH_PROVIDERS[provider]?.label ?? provider} linking. Please try again.`,
      });
      setPendingProvider(null);
    }
  }

  async function handleUnlinkProvider(provider: OAuthProvider) {
    setProviderMessage(null);
    setPendingProvider(provider);
    try {
      await unlinkMutation.mutateAsync(provider);
      setProviderMessage({
        type: 'success',
        text: `${OAUTH_PROVIDERS[provider]?.label ?? provider} account unlinked.`,
      });
    } catch (err: unknown) {
      const fallback = `Failed to unlink ${OAUTH_PROVIDERS[provider]?.label ?? provider}.`;
      const parsed = await parseApiFieldErrors(err, fallback);
      setProviderMessage({ type: 'error', text: parsed.non_field_errors || fallback });
    } finally {
      setPendingProvider(null);
    }
  }

  const providers = user?.providers ?? [];
  const providerEmails = user?.provider_emails ?? {};
  const uniqueEmails = Array.from(
    new Set([user?.email, ...Object.values(providerEmails)].filter((e): e is string => Boolean(e)))
  );
  const currentAvatarUrl = previewUrl || user?.avatar_url;

  return (
    <main className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center overflow-hidden px-4 py-12 md:px-6">
      <SpinBackdrop />

      {/* Header */}
      <div className="relative">
        <h1 className="font-display text-3xl tracking-wide [text-shadow:2px_2px_0_color-mix(in_srgb,var(--ink)_22%,transparent)] md:text-4xl">
          Account Settings
        </h1>
        <p className="mt-2 font-bold tracking-widest text-zinc-400 uppercase">
          Welcome back{user ? `, ${user.display_name || user.username}` : ''}
        </p>
      </div>

      {/* Username Collision Warning Notice */}
      {isCollisionNotice && (
        <Alert
          variant="warning"
          title="Username Notice"
          className="mt-8 p-4 shadow-[3px_3px_0_var(--ink)]"
        >
          Your preferred username from your connected account was already in use by another member,
          so we assigned you <strong className="font-mono font-bold">@{user?.username}</strong>. You
          can choose a unique handle of your choice below!
        </Alert>
      )}

      {/* Profile Details Section */}
      <form
        onSubmit={handleSubmit}
        className="border-ink mt-8 rounded-none border-2 border-dashed bg-white/70 p-6 backdrop-blur-sm md:p-8 dark:bg-[#373b3e]/70"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-sm font-bold tracking-widest uppercase">
            Profile Details
          </h2>
          {!isEditing && (
            <EditButton
              variant="button"
              label="Edit"
              onClick={() => {
                setSuccessMessage(null);
                setIsEditing(true);
              }}
            />
          )}
        </div>

        {/* Success & Global Error Alerts */}
        <StatusBanner
          variant="success"
          message={successMessage}
          autoDismissMs={3000}
          onDismiss={() => setSuccessMessage(null)}
        />
        <StatusBanner variant="error" message={formErrors.non_field_errors} />

        {/* Avatar & Profile Identity */}
        <div className={cn('mt-6', isEditing && 'border-ink border-b-2 border-dashed pb-6')}>
          {isEditing && (
            <label className="font-display block text-xs tracking-wider uppercase">
              Profile Picture
            </label>
          )}

          <div
            className={cn(
              'flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between',
              isEditing && 'mt-4'
            )}
          >
            <div className="flex min-w-0 items-center gap-4 sm:gap-5">
              {isEditing ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Upload profile picture"
                  className="group border-ink relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden border-2 bg-zinc-100 shadow-[3px_3px_0_var(--ink)] transition-transform hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0_var(--ink)] sm:h-24 sm:w-24 dark:bg-zinc-800"
                >
                  <UserAvatar
                    src={currentAvatarUrl}
                    alt="Profile Avatar"
                    size="xl"
                    framed={false}
                    className="h-full w-full"
                    imgClassName="transition-opacity group-hover:opacity-60"
                    iconClassName="transition-opacity group-hover:opacity-60"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="h-5 w-5 drop-shadow-sm" />
                    <span className="font-display text-[9px] font-bold tracking-wider uppercase drop-shadow-sm">
                      Change
                    </span>
                  </div>
                </button>
              ) : (
                <UserAvatar
                  src={currentAvatarUrl}
                  alt="Profile Avatar"
                  size="xl"
                  className="h-20 w-20 shadow-[3px_3px_0_var(--ink)] sm:h-24 sm:w-24"
                />
              )}

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Display Name and Username Info */}
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-base font-bold text-zinc-900 sm:text-lg dark:text-white">
                  {displayName || user?.display_name || user?.username}
                </p>
                <p className="truncate font-mono text-xs text-zinc-500 dark:text-zinc-400">
                  @{username || user?.username}
                </p>

                {isEditing && fileError && (
                  <p className="text-xs font-bold text-red-600 dark:text-red-400">{fileError}</p>
                )}
                {isEditing && formErrors.avatar && (
                  <p className="text-xs font-bold text-red-600 dark:text-red-400">
                    {formErrors.avatar}
                  </p>
                )}
              </div>
            </div>

            {!isEditing && user && (
              <div className="border-ink/20 flex flex-col gap-1.5 border-t-2 border-dashed pt-4 text-xs text-zinc-600 sm:shrink-0 sm:items-end sm:border-t-0 sm:pt-0 sm:text-right dark:text-zinc-300">
                {user.role && user.role !== 'user' && (
                  <span className="border-ink bg-accent-pop font-display inline-block self-start rounded-[2px] border-2 px-2 py-0.5 text-[10px] tracking-wide text-white uppercase shadow-[2px_2px_0_var(--ink)] sm:self-end">
                    {user.role}
                  </span>
                )}
                {uniqueEmails.map((email) => (
                  <p
                    key={email}
                    className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-300"
                  >
                    <Mail className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                    <span className="truncate">{email}</span>
                  </p>
                ))}
                {user.date_joined && (
                  <p className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                    <Calendar className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                    <span>Member since {format(parseDate(user.date_joined), 'MMM d, yyyy')}</span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Form Inputs Grid & Submit Actions (Edit Mode Only) */}
        {isEditing && (
          <>
            {/* Form Inputs Grid */}
            <div className="mt-6 space-y-6">
              {/* Username Input */}
              <FormField
                label="Username"
                htmlFor="username"
                count={username.length}
                maxCount={20}
                error={formErrors.username}
                hint="Required. 20 characters or fewer. Letters, digits, and @/./+/-/_ only."
              >
                <TextInput
                  ref={usernameInputRef}
                  id="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (formErrors.username) {
                      setFormErrors((prev) => {
                        const next = { ...prev };
                        delete next.username;
                        return next;
                      });
                    }
                  }}
                  icon={AtSign}
                  placeholder="username"
                  maxLength={20}
                  error={Boolean(formErrors.username)}
                  className="font-mono"
                />
              </FormField>

              {/* Display Name Input */}
              <FormField
                label="Display Name"
                htmlFor="display_name"
                count={displayName.length}
                maxCount={20}
                error={formErrors.display_name}
                hint="20 characters or fewer. How your name is displayed on meetups, comments, and galleries."
              >
                <TextInput
                  id="display_name"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    if (formErrors.display_name) {
                      setFormErrors((prev) => {
                        const next = { ...prev };
                        delete next.display_name;
                        return next;
                      });
                    }
                  }}
                  placeholder="Friendly Name"
                  maxLength={20}
                  error={Boolean(formErrors.display_name)}
                />
              </FormField>
            </div>

            {/* Submit Actions */}
            <FormActions
              onCancel={handleCancelEdit}
              isSubmitting={updateMutation.isPending}
              submitIcon={<Check className="h-4 w-4 stroke-3" />}
              submitLabel={
                <>
                  <span className="hidden sm:inline">Save Changes</span>
                  <span className="sm:hidden">Save</span>
                </>
              }
              submittingLabel="Saving…"
              className="border-ink mt-8 border-t-2 border-dashed pt-6"
            />
          </>
        )}
      </form>

      {/* Connected Accounts Section */}
      <section className="border-ink mt-8 rounded-none border-2 border-dashed bg-white/70 p-6 backdrop-blur-sm md:p-8 dark:bg-[#373b3e]/70">
        <h2 className="font-display text-sm font-bold tracking-widest uppercase">
          Connected Accounts
        </h2>

        <StatusBanner
          variant={providerMessage?.type ?? 'success'}
          message={providerMessage?.text}
          autoDismissMs={providerMessage?.type === 'success' ? 3000 : undefined}
          onDismiss={() => setProviderMessage(null)}
        />

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(['discord', 'google'] as OAuthProvider[]).map((provider) => {
            const config = OAUTH_PROVIDERS[provider];
            const isConnected = providers.includes(provider);
            const isOnlyProvider = isConnected && providers.length <= 1;
            const isBusy = pendingProvider === provider;

            return (
              <div
                key={provider}
                className={cn(
                  'border-ink flex flex-col justify-between border-2 p-4 transition-colors',
                  isConnected
                    ? 'bg-white shadow-[3px_3px_0_var(--ink)] dark:bg-zinc-900'
                    : 'bg-zinc-50/70 dark:bg-zinc-900/40'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'border-ink flex h-10 w-10 shrink-0 items-center justify-center border-2 shadow-[2px_2px_0_var(--ink)]',
                        config.textClassName
                      )}
                      style={{ backgroundColor: config.backgroundColor }}
                    >
                      {config.icon}
                    </div>
                    <div>
                      <p className="font-display text-sm font-bold tracking-wide uppercase">
                        {config.label}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                        {isConnected ? providerEmails[provider] || 'Connected' : 'Not linked'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-ink/20 mt-4 flex items-center gap-2 border-t-2 border-dashed pt-3">
                  {isConnected ? (
                    <>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isBusy}
                        onClick={() => handleLinkProvider(provider, 'relink')}
                        title={`Switch to a different ${config.label} account`}
                        className="flex-1"
                      >
                        <RefreshCw className={cn('h-3.5 w-3.5', isBusy && 'animate-spin')} />
                        <span>Relink</span>
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isOnlyProvider || isBusy}
                        onClick={() => handleUnlinkProvider(provider)}
                        title={
                          isOnlyProvider
                            ? 'At least one connected account must remain linked'
                            : `Unlink ${config.label}`
                        }
                        className="flex-1 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                      >
                        <Unlink className="h-3.5 w-3.5" />
                        <span>Unlink</span>
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      fullWidth
                      disabled={isBusy}
                      onClick={() => handleLinkProvider(provider, 'connect')}
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      <span>Connect {config.label}</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-300">
          At least one connected account must remain linked. You can connect accounts with different
          email addresses here.
        </p>
      </section>
    </main>
  );
}
