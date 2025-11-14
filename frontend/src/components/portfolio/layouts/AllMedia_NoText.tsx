import React from "react";
import BaseOneBox from "../primitives/BaseOneBox";
import MediaSlot from "../primitives/MediaSlot";
import PageInfo from "../PageInfo";

type PortfolioPageProps = {
  mediaSrc?: string;
  mediaShape?: "1:1" | "9:16" | "16:9" | "4:5" | "5:4";
}

export default function AllMedia_NoText({ mediaSrc, mediaShape }: PortfolioPageProps) {
  return (
    // a is the TOP box, b is the BOTTOM box
    <BaseOneBox
      a={ // Top box = Media
        <div className="flex justify-center md:justify-center">
          <MediaSlot src="/media/example.jpg" alt="Media" shape="1:1" align="center"/>
        </div>
      }
    />
  );
}