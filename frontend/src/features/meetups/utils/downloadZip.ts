import JSZip from 'jszip';

export interface PhotoDownloadItem {
  id: number;
  url: string;
  name?: string;
}

export interface DownloadProgress {
  current: number;
  total: number;
  status: 'fetching' | 'compressing' | 'saving' | 'done' | 'error';
}

/**
 * Downloads multiple photos in chunked batches directly in the client and saves as a ZIP file.
 * Zero server CPU or bandwidth load.
 */
export async function downloadPhotosAsZip({
  photos,
  zipFilename = 'meetup-photos.zip',
  onProgress,
}: {
  photos: PhotoDownloadItem[];
  zipFilename?: string;
  onProgress?: (progress: DownloadProgress) => void;
}): Promise<void> {
  if (!photos.length) return;

  const zip = new JSZip();
  const total = photos.length;

  onProgress?.({ current: 0, total, status: 'fetching' });

  const BATCH_SIZE = 3;
  let completed = 0;

  for (let i = 0; i < photos.length; i += BATCH_SIZE) {
    const batch = photos.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (photo, batchIdx) => {
        const photoNum = i + batchIdx + 1;
        try {
          const res = await fetch(photo.url);
          if (!res.ok) throw new Error(`Failed to fetch image ${photo.id}`);
          const blob = await res.blob();

          const extMatch = photo.url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
          const ext = extMatch ? extMatch[1] : 'webp';
          const filename = photo.name
            ? `${photo.name}.${ext}`
            : `photo-${String(photoNum).padStart(3, '0')}.${ext}`;

          zip.file(filename, blob);
        } catch (err) {
          console.error(`Error downloading photo ${photo.id}:`, err);
        } finally {
          completed += 1;
          onProgress?.({
            current: completed,
            total,
            status: 'fetching',
          });
        }
      })
    );
  }

  onProgress?.({ current: total, total, status: 'compressing' });

  const zipBlob = await zip.generateAsync({ type: 'blob' });

  onProgress?.({ current: total, total, status: 'saving' });

  const link = document.createElement('a');
  const objectUrl = URL.createObjectURL(zipBlob);
  link.href = objectUrl;
  link.download = zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);

  onProgress?.({ current: total, total, status: 'done' });
}
