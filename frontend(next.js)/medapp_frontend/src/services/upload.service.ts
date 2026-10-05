import API from "@/lib/axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function uploadImage(file: File, folder: string): Promise<string> {
  const formData = new FormData();

  formData.append("file", file);

  const { data } = await API.post(`${API_BASE_URL}/upload/${folder}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data.url;
}

export function getImageUrl(photoUrl: string): string {
  if (!photoUrl) return "";

  if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) {
    return photoUrl;
  }

  return `${API_BASE_URL}${photoUrl.startsWith("/") ? "" : "/"}${photoUrl}`;
}
