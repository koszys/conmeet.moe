import { MikuLoader } from '@/shared/components/miku';

export function MeetupDetailSkeleton() {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center py-16">
      <MikuLoader message="Opening meetup coordinates..." size="lg" />
    </div>
  );
}
