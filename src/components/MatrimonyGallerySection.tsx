import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import { CheckCircle2, Eye, ImagePlus, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getMyMatrimonyProfile,
  saveMatrimonyProfileOnServer,
} from "../lib/matrimonyApi";

const MAX_GALLERY_ITEMS = 5;

export type MatrimonyGalleryPhoto = {
  id: string;
  url: string;
  caption?: string;
  isProfilePhoto?: boolean;
  storageKey?: string;
  uploadedAt?: string;
};

export type MatrimonyGalleryVideo = {
  id: string;
  youtubeUrl: string;
  title?: string;
  createdAt?: string;
};

const normalizePhoto = (raw: any): MatrimonyGalleryPhoto | null => {
  if (!raw) return null;
  const url = raw.url || raw.src;
  if (!url) return null;
  return {
    id: raw.id || raw._id || uuidv4(),
    url,
    caption: raw.caption || raw.title || "",
    isProfilePhoto: Boolean(raw.isProfilePhoto),
    storageKey: raw.storageKey,
    uploadedAt: raw.uploadedAt || raw.createdAt,
  };
};

const normalizeVideo = (raw: any): MatrimonyGalleryVideo | null => {
  if (!raw) return null;
  const youtubeUrl = raw.youtubeUrl || raw.url;
  if (!youtubeUrl) return null;
  return {
    id: raw.id || raw._id || uuidv4(),
    youtubeUrl,
    title: raw.title || "",
    createdAt: raw.createdAt,
  };
};

export const MatrimonyGallerySection: React.FC = () => {
  const { uploadMatrimonialImage, deleteMatrimonialImage } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullProfileBase, setFullProfileBase] = useState<any | null>(null);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  const [photos, setPhotos] = useState<MatrimonyGalleryPhoto[]>([]);
  const [videos, setVideos] = useState<MatrimonyGalleryVideo[]>([]);

  // const [newVideoUrl, setNewVideoUrl] = useState('');
  // const [newVideoTitle, setNewVideoTitle] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getMyMatrimonyProfile();

        if (!isMounted) return;

        if (!result.ok) {
          if (result.notFound) {
            setError(
              "Create your matrimony profile before adding photos or videos."
            );
          } else if (result.authError) {
            setError(
              result.message || "Please login again to manage your gallery."
            );
          } else {
            setError(result.error || "Failed to load gallery data.");
          }
          setLoading(false);
          return;
        }

        const full = (result.profile as any).fullProfile || {};

        const rawGallery = Array.isArray((full as any).gallery)
          ? (full as any).gallery
          : [];
        const rawVideos = Array.isArray((full as any).galleryVideos)
          ? (full as any).galleryVideos
          : Array.isArray((full as any).videos)
          ? (full as any).videos
          : [];

        const normalizedPhotos = rawGallery
          .map((item: any) => normalizePhoto(item))
          .filter(Boolean) as MatrimonyGalleryPhoto[];
        const normalizedVideos = rawVideos
          .map((item: any) => normalizeVideo(item))
          .filter(Boolean) as MatrimonyGalleryVideo[];

        setFullProfileBase(full);
        setHasExistingProfile(true);
        setPhotos(normalizedPhotos);
        setVideos(normalizedVideos);
        setLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        console.error("Failed to load matrimony gallery", err);
        setError(err?.message || "Failed to load gallery data.");
        setLoading(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  const syncToServer = async (
    nextPhotos: MatrimonyGalleryPhoto[],
    nextVideos: MatrimonyGalleryVideo[]
  ) => {
    if (!fullProfileBase || !hasExistingProfile) {
      toast.error("Create your matrimony profile before updating the gallery.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const primaryPhoto =
        nextPhotos.find((p) => p.isProfilePhoto) || nextPhotos[0] || null;

      const fullProfile = {
        ...fullProfileBase,
        gallery: nextPhotos,
        galleryVideos: nextVideos,
        ...(primaryPhoto
          ? {
              profilePhoto: primaryPhoto.url,
              profilePhotoStorageKey: primaryPhoto.storageKey || "",
            }
          : {}),
      };

      const result = await saveMatrimonyProfileOnServer(fullProfile, {
        hasExisting: true,
      });

      if (!result.ok) {
        throw new Error(result.error || "Failed to save gallery.");
      }

      setFullProfileBase(fullProfile);
      setPhotos(nextPhotos);
      setVideos(nextVideos);

      if (typeof window !== "undefined") {
        try {
          if (primaryPhoto) {
            window.localStorage.setItem("qrMatrimonyPhoto", primaryPhoto.url);
          } else {
            window.localStorage.removeItem("qrMatrimonyPhoto");
          }
          window.dispatchEvent(new Event("qrMatrimonyPhotoUpdated"));
        } catch {
          // ignore
        }
      }
      toast.success("Gallery updated successfully");
    } catch (err: any) {
      console.error("Failed to save matrimony gallery", err);
      setError(err?.message || "Failed to save gallery.");
      toast.error(err?.message || "Failed to save gallery.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddPhotoClick = () => {
    if (photos.length >= MAX_GALLERY_ITEMS) {
      toast.error(`You can upload up to ${MAX_GALLERY_ITEMS} photos.`);
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (
    event
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2 MB.");
      event.target.value = "";
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadMatrimonialImage(formData);

      if (!result.success || !result.item) {
        throw new Error(result.error || "Failed to upload image.");
      }

      const item = result.item;

      const newPhoto: MatrimonyGalleryPhoto = {
        id: item._id || item.id || uuidv4(),
        url: item.url,
        caption: item.title || "",
        isProfilePhoto:
          photos.length === 0 || !photos.some((p) => p.isProfilePhoto),
        storageKey: item.storageKey,
        uploadedAt: item.createdAt || new Date().toISOString(),
      };

      const nextPhotos = [...photos, newPhoto];
      await syncToServer(nextPhotos, videos);
    } catch (err: any) {
      console.error("Upload failed", err);
      toast.error(err?.message || "Failed to upload image.");
    } finally {
      event.target.value = "";
    }
  };

  const handleDeletePhoto = async (photo: MatrimonyGalleryPhoto) => {
    const prevPhotos = photos;
    const nextPhotos = photos.filter((p) => p.id !== photo.id);

    try {
      if (photo.storageKey) {
        const result = await deleteMatrimonialImage({
          storageKey: photo.storageKey,
        });

        if (!result.success) {
          throw new Error(
            result.error || "Failed to delete image from storage."
          );
        }
      }

      await syncToServer(nextPhotos, videos);
    } catch (err: any) {
      console.error("Delete photo failed", err);
      toast.error(err?.message || "Failed to delete image.");
      setPhotos(prevPhotos);
    }
  };

  const handleSetProfilePhoto = (id: string) => {
    const nextPhotos = photos.map((p) => ({
      ...p,
      isProfilePhoto: p.id === id,
    }));
    void syncToServer(nextPhotos, videos);
  };

  // const handleAddVideo = () => {
  //   const trimmedUrl = newVideoUrl.trim();
  //   if (!trimmedUrl) {
  //     toast.error('Please paste a YouTube video URL.');
  //     return;
  //   }

  // const nextVideos: MatrimonyGalleryVideo[] = [
  //   ...videos,
  //   {
  //     id: uuidv4(),
  //     youtubeUrl: trimmedUrl,
  //     title: newVideoTitle.trim(),
  //     createdAt: new Date().toISOString(),
  //   },
  // ];

  //   setNewVideoUrl('');
  //   setNewVideoTitle('');
  //   void syncToServer(photos, nextVideos);
  // };

  // const handleRemoveVideo = (id: string) => {
  //   const nextVideos = videos.filter((v) => v.id !== id);
  //   void syncToServer(photos, nextVideos);
  // };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-gray-500">Loading your gallery…</p>
      </div>
    );
  }

  if (error && !hasExistingProfile) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-black text-[#2e1d22] tracking-tight">
            Photo Gallery
          </h1>
          <p className="text-[#9c6b79] mt-2 max-w-2xl text-base">{error}</p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.location.href = "/matrimonial-profile?tab=edit";
            }
          }}
          className="w-fit bg-[#f07f9c] text-[#2e1d22] hover:bg-[#e06886] px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-sm"
        >
          Create / Edit Profile
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-[#f2e6ea] pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#2e1d22] tracking-tight">
            Photo Gallery
          </h1>
          <p className="text-[#9c6b79] mt-2 max-w-2xl text-base">
            Add photos to your profile to get 5x more responses. Photos are
            visible to premium members and matches you accept.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className="text-sm font-bold text-[#9c6b79]">
            {photos.length} of {MAX_GALLERY_ITEMS} Photos Uploaded
          </span>
          <button
            type="button"
            onClick={handleAddPhotoClick}
            disabled={saving}
            className="bg-[#f07f9c] text-[#2e1d22] hover:bg-[#e06886] px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-sm disabled:opacity-60"
          >
            <ImagePlus className="h-5 w-5" />
            Upload Photos
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <span className="text-[11px] text-[#9c6b79]">
            Up to {MAX_GALLERY_ITEMS} photos • Max 2 MB each
          </span>
        </div>
      </div>

      {/* <div className="bg-[#fffafb] border border-[#f2e6ea] rounded-xl p-5 flex gap-4 items-start">
        <div className="p-2 bg-white rounded-full text-[#f07f9c] shadow-sm shrink-0">
          <Lock className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-[#2e1d22] text-sm">
            Your Privacy Matters
          </h3>
          <p className="text-sm text-[#9c6b79] mt-1 leading-relaxed">
            You have full control over your photos. You can choose to make them
            visible only to premium members or only to people you have connected
            with.
          </p>
          <button
            type="button"
            className="text-[#f07f9c] text-xs font-bold mt-2 hover:underline"
          >
            Manage Privacy Settings
          </button>
        </div>
      </div> */}

      {error && hasExistingProfile && (
        <p className="text-xs text-rose-500">{error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-white shadow-sm border border-[#f2e6ea] transition-all hover:shadow-md"
          >
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.open(photo.url, "_blank");
                }
              }}
              className="block w-full h-full"
              aria-label="View photo"
            >
              <img
                alt={photo.caption || "Profile photo"}
                className="w-full h-full object-cover"
                src={photo.url}
              />
            </button>

            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {photo.isProfilePhoto && (
                <span className="bg-[#f07f9c]/90 backdrop-blur text-[#2e1d22] text-[10px] font-bold px-2.5 py-1 rounded shadow-sm w-fit">
                  Profile Picture
                </span>
              )}
              <span className="bg-green-500/90 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-sm flex items-center gap-1 w-fit">
                <CheckCircle2 className="h-3 w-3" />
                Approved
              </span>
            </div>

            <div className="hidden sm:flex absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex-col items-center justify-center gap-3 p-4">
              <button
                type="button"
                onClick={() => handleSetProfilePhoto(photo.id)}
                className="bg-white text-[#2e1d22] w-full py-2.5 rounded-lg font-bold text-xs hover:bg-gray-50 transition-colors"
              >
                {photo.isProfilePhoto
                  ? "Change Profile Pic"
                  : "Set as Profile Pic"}
              </button>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(photo)}
                  className="size-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white hover:text-red-600 transition-colors"
                  title="Delete"
                  aria-label="Delete"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.open(photo.url, "_blank");
                    }
                  }}
                  className="size-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white hover:text-[#2e1d22] transition-colors"
                  title="View Fullscreen"
                  aria-label="View Fullscreen"
                >
                  <Eye className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="sm:hidden absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (typeof window !== "undefined") {
                      window.open(photo.url, "_blank");
                    }
                  }}
                  className="size-10 bg-white/15 backdrop-blur rounded-full flex items-center justify-center text-white"
                  aria-label="View"
                >
                  <Eye className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetProfilePhoto(photo.id);
                  }}
                  className="flex-1 h-10 bg-white text-[#2e1d22] rounded-full px-4 text-xs font-bold"
                >
                  {photo.isProfilePhoto ? "Profile Pic" : "Set Profile Pic"}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePhoto(photo);
                  }}
                  className="size-10 bg-white/15 backdrop-blur rounded-full flex items-center justify-center text-white"
                  aria-label="Delete"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {photos.length < MAX_GALLERY_ITEMS && (
          <button
            type="button"
            onClick={handleAddPhotoClick}
            disabled={saving}
            className="aspect-[3/4] rounded-xl border-2 border-dashed border-[#e6d9de] bg-[#fffafb] hover:border-[#f07f9c] hover:bg-[#f07f9c]/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 group text-[#9c6b79] disabled:opacity-60"
          >
            <div className="size-16 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:text-[#f07f9c] transition-all duration-300">
              <Plus className="h-8 w-8" />
            </div>
            <span className="font-bold text-sm group-hover:text-[#f07f9c] transition-colors">
              Add Photo
            </span>
          </button>
        )}
      </div>

      {/* <div className="mt-4 space-y-3 rounded-2xl border border-rose-100 bg-rose-50 p-4">
        <p className="text-sm font-medium text-rose-900">YouTube videos</p>
        <p className="text-xs text-gray-500">
          Paste YouTube video links that you want to highlight on your public matrimony page.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="url"
            value={newVideoUrl}
            onChange={(e) => setNewVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 rounded-full border border-rose-100 bg-white px-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
          />
          <input
            type="text"
            value={newVideoTitle}
            onChange={(e) => setNewVideoTitle(e.target.value)}
            placeholder="Title (optional)"
            className="flex-1 rounded-full border border-rose-100 bg-white px-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
          />
          <button
            type="button"
            onClick={handleAddVideo}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-amber-400 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:from-rose-600 hover:to-amber-400 disabled:opacity-60 transition-colors"
            disabled={saving}
          >
            Add video
          </button>
        </div>

        {videos.length > 0 && (
          <ul className="mt-3 space-y-2 text-xs text-gray-700">
            {videos.map((video) => (
              <li
                key={video.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-rose-100 bg-white px-3 py-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-gray-900">
                    {video.title || 'YouTube video'}
                  </p>
                  <p className="truncate text-[11px] text-gray-500">{video.youtubeUrl}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveVideo(video.id)}
                  className="text-rose-600 hover:text-rose-700 text-[11px]"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        {videos.length === 0 && (
          <p className="mt-1 text-[11px] text-slate-400">
            No videos added yet.
          </p>
        )}
      </div> */}
      {/* 
      {saving && (
        <p className="text-[11px] text-gray-500">Saving changes…</p>
      )} */}
    </div>
  );
};
