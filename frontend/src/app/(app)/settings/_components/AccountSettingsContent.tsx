'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AlertTriangle, AtSign, Camera, Check, RotateCw, Trash2, UserRound } from 'lucide-react';
import { useAuth, useUpdateProfile } from '@/features/auth';
import { SpinBackdrop } from '@/shared/components/miku';
import { Button, TextInput } from '@/shared/components/ui';
import discordLogo from '@/assets/social/discordlogo.png';
import { cn } from '@/shared/lib/utils';

function GoogleLogo({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <path
        fill="#FFC107"
        d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.6 39.6 16.3 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.7l6.2 5.2C36.9 39.3 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"
      />
    </svg>
  );
}

const PROVIDERS: Record<
  string,
  { label: string; backgroundColor: string; textClassName: string; icon: React.ReactNode }
> = {
  discord: {
    label: 'Discord',
    backgroundColor: '#5865F2',
    textClassName: '!text-white',
    icon: <Image src={discordLogo} alt="" width={16} height={16} className="brightness-0 invert" />,
  },
  google: {
    label: 'Google',
    backgroundColor: '#ffffff',
    textClassName: '!text-ink',
    icon: <GoogleLogo className="h-4 w-4" />,
  },
};

export function AccountSettingsContent() {
  const { user, usernameCollisionNotice, dismissUsernameCollisionNotice } = useAuth();
  const updateMutation = useUpdateProfile();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState(user?.username || '');
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removeAvatarPending, setRemoveAvatarPending] = useState(false);

  const [isCollisionNotice, setIsCollisionNotice] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync initial user data
  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setDisplayName(user.display_name || '');
    }
  }, [user]);

  // Check URL param or context for username collision warning
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('username_collision') === '1' || usernameCollisionNotice) {
      setIsCollisionNotice(true);
      usernameInputRef.current?.focus();
    }
  }, [usernameCollisionNotice]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFileError('Image file size must not exceed 5MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setFileError('Please select a valid image file (PNG, JPG, WEBP, GIF).');
      return;
    }

    setFileError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setRemoveAvatarPending(false);
  }

  function handleRevertToSocial() {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setRemoveAvatarPending(true);
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

    const formData = new FormData();
    formData.append('username', trimmedUsername);
    formData.append('display_name', displayName.trim());

    if (removeAvatarPending) {
      formData.append('remove_avatar', 'true');
    } else if (selectedFile) {
      formData.append('avatar', selectedFile);
    }

    try {
      await updateMutation.mutateAsync(formData);
      setSuccessMessage('Account profile updated successfully!');
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setRemoveAvatarPending(false);
      setIsCollisionNotice(false);
      dismissUsernameCollisionNotice();

      // Clean up URL parameter if present
      if (window.location.search.includes('username_collision')) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        try {
          const res = (err as { response: Response }).response;
          const data = await res.json();
          if (data && typeof data === 'object') {
            const mapped: Record<string, string> = {};
            for (const [key, val] of Object.entries(data)) {
              mapped[key] = Array.isArray(val) ? val.join(' ') : String(val);
            }
            setFormErrors(mapped);
            return;
          }
        } catch {
          // fallback
        }
      }
      setFormErrors({ non_field_errors: 'Failed to update account. Please try again.' });
    }
  }

  const providers = user?.providers ?? [];
  const currentAvatarUrl = previewUrl || (!removeAvatarPending ? user?.avatar_url : null);

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
        <div
          role="alert"
          className="border-ink mt-8 border-2 bg-amber-100 p-4 shadow-[3px_3px_0_var(--ink)] dark:bg-amber-950/40"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-400" />
            <div>
              <h3 className="font-display text-xs font-bold tracking-wider text-amber-900 uppercase dark:text-amber-200">
                Username Notice
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-amber-900 dark:text-amber-300">
                Your preferred username from your connected account was already in use by another
                member, so we assigned you{' '}
                <strong className="font-mono font-bold">@{user?.username}</strong>. You can choose a
                unique handle of your choice below!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Form Section */}
      <form
        onSubmit={handleSubmit}
        className="border-ink mt-8 rounded-none border-2 border-dashed bg-white/70 p-6 backdrop-blur-sm md:p-8 dark:bg-[#373b3e]/70"
      >
        <h2 className="font-display text-sm font-bold tracking-widest uppercase">
          Profile Details
        </h2>

        {/* Success Alert */}
        {successMessage && (
          <div className="border-ink mt-4 flex items-center gap-2 border-2 bg-emerald-100 p-3 text-xs font-bold text-emerald-900 shadow-[2px_2px_0_var(--ink)] dark:bg-emerald-950/40 dark:text-emerald-200">
            <Check className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Global Error Alert */}
        {formErrors.non_field_errors && (
          <div className="border-ink mt-4 flex items-center gap-2 border-2 bg-red-100 p-3 text-xs font-bold text-red-900 shadow-[2px_2px_0_var(--ink)] dark:bg-red-950/40 dark:text-red-200">
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-700 dark:text-red-400" />
            <span>{formErrors.non_field_errors}</span>
          </div>
        )}

        {/* Avatar Customization */}
        <div className="border-ink mt-6 border-b-2 border-dashed pb-6">
          <label className="font-display block text-xs tracking-wider uppercase">
            Profile Picture (PFP)
          </label>

          <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* Avatar Frame */}
            <div className="border-ink relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden border-2 bg-zinc-100 shadow-[3px_3px_0_var(--ink)] dark:bg-zinc-800">
              {currentAvatarUrl ? (
                <img
                  src={currentAvatarUrl}
                  alt="Profile Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound className="h-10 w-10 text-zinc-400" />
              )}

              {removeAvatarPending && (
                <span className="font-display absolute right-1 bottom-1 bg-amber-500 px-1 py-0.5 text-[8px] font-bold text-white uppercase">
                  Reset
                </span>
              )}
            </div>

            {/* Avatar Controls */}
            <div className="flex-1 space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5"
                >
                  <Camera className="h-3.5 w-3.5" />
                  <span>Change Avatar</span>
                </Button>

                {/* Show Revert button if custom avatar is active and not already pending removal */}
                {user?.has_custom_avatar && !removeAvatarPending && !selectedFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRevertToSocial}
                    className="flex items-center gap-1.5 text-zinc-600 hover:text-red-600 dark:text-zinc-300 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Revert to Social Avatar</span>
                  </Button>
                )}
              </div>

              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                PNG, JPG, WEBP, or GIF (max 5MB). Processed into a 256×256 square. Previous avatars
                are automatically removed from storage.
              </p>

              {fileError && (
                <p className="text-xs font-bold text-red-600 dark:text-red-400">{fileError}</p>
              )}
              {formErrors.avatar && (
                <p className="text-xs font-bold text-red-600 dark:text-red-400">
                  {formErrors.avatar}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="mt-6 space-y-6">
          {/* Username Input */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="username"
                className="font-display block text-xs tracking-wider uppercase"
              >
                Username
              </label>
              <span
                className={cn(
                  'font-mono text-[11px] font-bold',
                  username.length > 20 ? 'text-red-600' : 'text-zinc-400'
                )}
              >
                {username.length}/20
              </span>
            </div>

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
              className="mt-1.5 font-mono"
            />

            {formErrors.username ? (
              <p className="mt-1 text-xs font-bold text-red-600 dark:text-red-400">
                {formErrors.username}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                Required. 20 characters or fewer. Letters, digits, and @/./+/-/_ only.
              </p>
            )}
          </div>

          {/* Display Name Input */}
          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="display_name"
                className="font-display block text-xs tracking-wider uppercase"
              >
                Display Name
              </label>
              <span
                className={cn(
                  'font-mono text-[11px] font-bold',
                  displayName.length > 64 ? 'text-red-600' : 'text-zinc-400'
                )}
              >
                {displayName.length}/64
              </span>
            </div>

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
              maxLength={64}
              error={Boolean(formErrors.display_name)}
              className="mt-1.5"
            />

            {formErrors.display_name ? (
              <p className="mt-1 text-xs font-bold text-red-600 dark:text-red-400">
                {formErrors.display_name}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                How your name is displayed on meetups, comments, and galleries.
              </p>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="border-ink mt-8 flex items-center justify-end border-t-2 border-dashed pt-6">
          <Button
            type="submit"
            variant="primary"
            disabled={updateMutation.isPending}
            className="flex items-center gap-2"
          >
            {updateMutation.isPending ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin" />
                <span>Saving…</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </Button>
        </div>
      </form>

      {/* Connected Accounts Section */}
      <section className="border-ink mt-8 rounded-none border-2 border-dashed bg-white/70 p-6 backdrop-blur-sm md:p-8 dark:bg-[#373b3e]/70">
        <h2 className="text-sm font-bold tracking-widest text-zinc-400 uppercase">
          Connected Accounts
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {providers.length === 0 && (
            <span className="text-sm text-zinc-500 dark:text-zinc-300">
              No social accounts linked.
            </span>
          )}
          {providers.map((provider) => {
            const config = PROVIDERS[provider];
            if (!config) {
              return (
                <span
                  key={provider}
                  className="rounded-none border-2 px-3 py-1 text-sm font-bold tracking-wide uppercase"
                >
                  {provider}
                </span>
              );
            }
            return (
              <span
                key={provider}
                className={cn(
                  'flex items-center gap-2 rounded-none border-2 px-3 py-1 text-sm font-bold tracking-wide uppercase shadow-[2px_2px_0_var(--ink)]',
                  config.textClassName
                )}
                style={{ backgroundColor: config.backgroundColor }}
              >
                {config.icon}
                {config.label}
              </span>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-300">
          Same-email logins are linked to this account automatically.
        </p>
      </section>
    </main>
  );
}
