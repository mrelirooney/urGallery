// src/components/artist/ArtistHeader.tsx
import type { ArtistLanding } from "@/lib/types";

type Props = { profile?: ArtistLanding["profile"] };

export default function ArtistHeader({ profile }: Props) {
  if (!profile)
    return (
      <div className="text-center text-neutral-500 py-8">
        Loading artist info...
      </div>
    );

  const origin =
    (process.env.NEXT_PUBLIC_API_BASE ?? "")
      .replace(/\/+$/, "")
      .replace(/\/api$/, "") || "http://localhost:8000";

  const src =
  profile?.avatar_url && profile.avatar_url.length > 0
    ? profile.avatar_url            // use it as-is
    : "/avatars/default-avatar.png"; // your existing fallback
  
  const bannerSrc = profile?.banner_image_url || null;
  
  return (
    <div id="artist-profile" data-probe="ArtistHeader-V3" className="relative pt-24">
      {/* Content Container */}
      <div className="relative">
        {/* Top: Avatar */}
        <div className="justify-self-center md:justify-self-start">
          <div className="h-56 w-56 rounded-full overflow-hidden border border-neutral-300 shadow-sm bg-white">
            <img
              src={src}
              alt={`${profile?.display_name ?? "Artist"} avatar`}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
        <br></br>
        {/* Bottom: Name / Title / Dots / Location */}
        <div className="flex flex-col justify-center text-center md:text-left -mt-2">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900">
            {profile?.display_name ?? "Unknown Artist"}
          </h1>
        <p className="mt-1 text-lg text-neutral-700">{profile?.title ?? ""}</p>

        {/* placeholder for contact row */}
        <div className="mt-3 flex justify-center md:justify-start gap-2.5">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
          ))}
        </div>

        <p className="mt-1 text-base text-neutral-600">
          {profile?.location ?? ""}
        </p>
      </div>

        {/* Row 2: Bio */}
        <div className="md:col-span-2">
          <p className="mt-1 max-w-3xl text-neutral-700 leading-relaxed">
            Bio:<br></br>
            {profile.bio || "This artist hasn't added a bio yet."}
          </p>
        </div>
      </div>
    </div>
  );
}
