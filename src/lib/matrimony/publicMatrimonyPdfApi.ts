import axios from 'axios';

export const downloadPublicMatrimonyProfilePdf = async (profileId: string) => {
  const normalized = typeof profileId === 'string' ? profileId.trim() : '';
  if (!normalized) {
    return {
      ok: false as const,
      status: 400,
      error: 'Profile id is required.',
    };
  }

  try {
    const response = await axios.get<ArrayBuffer>(
      `/api/public-matrimony/${normalized}/pdf`,
      {
        responseType: 'arraybuffer',
        validateStatus: () => true,
      },
    );

    const status = response.status;
    const contentType = String(response.headers?.['content-type'] || '').toLowerCase();

    const isPdf = contentType.includes('application/pdf');
    if (!isPdf || status < 200 || status >= 300) {
      let message = 'Failed to download profile PDF.';
      try {
        const text = new TextDecoder('utf-8').decode(response.data);
        const parsed = JSON.parse(text);
        message = parsed?.message || parsed?.error || message;
      } catch {
        // ignore decode errors
      }

      return {
        ok: false as const,
        status,
        error: message,
      };
    }

    const blob = new Blob([response.data], { type: 'application/pdf' });

    return {
      ok: true as const,
      status,
      data: blob,
      filename: String(response.headers?.['content-disposition'] || ''),
    };
  } catch (error: any) {
    const status = error?.response?.status as number | undefined;

    return {
      ok: false as const,
      status: status ?? 0,
      error:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to download profile PDF.',
    };
  }
};
