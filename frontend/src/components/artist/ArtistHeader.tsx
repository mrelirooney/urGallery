// src/components/artist/ArtistHeader.tsx
import type { ArtistLanding } from "@/lib/types";

type Props = { profile: ArtistLanding["profile"] };

export default function ArtistHeader({ profile }: Props) {
  const origin =
    (process.env.NEXT_PUBLIC_API_BASE ?? "")
      .replace(/\/+$/, "")
      .replace(/\/api$/, "") || "http://localhost:8000";

  const src = `${origin}${profile.avatar_url ?? ""}`;

  return (
    <div className="flex gap-8 items-start" data-probe="ArtistHeader-V3">
      <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-pink-500">
        <img
          src={src || "/avatars/astra-chat-profilepic.jpeg"}
          alt={`${profile.display_name} avatar`}
          className="h-full w-full object-cover"
        />
      </div>
      {/* Profile Text */}
      <div className="flex flex-col justify-center text-neutral-900">
        <h1 className="text-2xl font-bold leading-tight">
          {profile.display_name}
        </h1>
        <p className="text-neutral-700">{profile.title}</p>
        <p className="text-neutral-600 text-sm">{profile.location}</p>
        {profile.bio && (
          <p className="text-neutral-800 mt-4 max-w-2xl">{profile.bio}</p>
        )}
      </div>
    </div>
  );
}