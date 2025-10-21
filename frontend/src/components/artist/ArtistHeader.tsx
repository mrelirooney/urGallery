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
    <div
      id="artist-profile"
      className="grid grid-cols-1 md:grid-cols-[18rem,auto] items-center md:items-start gap-5"
      data-probe="ArtistHeader-V3"
    >
      {/* Left: Avatar */}
      <div className="justify-self-center md:justify-self-start">
        <div className="h-56 w-56 rounded-full overflow-hidden border border-neutral-300 shadow-sm">
          <img
            src={src || "/avatars/astra-chat-profilepic.jpeg"}
            alt={`${profile.display_name} avatar`}
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      {/* Right: Name / Title / Dots / Location */}
      <div className="flex flex-col justify-center text-center md:text-left -mt-2">
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-900">
          {profile.display_name}
        </h1>
        <p className="mt-1 text-lg text-neutral-700">{profile.title}</p>

        {/* placeholder for contact row (will become icons later) */}
        <div className="mt-3 flex justify-center md:justify-start gap-2.5">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
          ))}
        </div>

        <p className="mt-1 text-base text-neutral-600">{profile.location}</p>
      </div>

      {/* Row 2: Bio stays where it is */}
      <div className="md:col-span-2">
        <p className="mt-6 max-w-3xl text-neutral-700 leading-relaxed">
          {profile.bio}
        </p>
      </div>
    </div>
  );
}