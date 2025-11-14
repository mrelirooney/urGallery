import React from "react";
import BaseTwoBoxes from "../primitives/BaseTwoBoxes";
import MediaSlotC , { MediaSlotR } from "../primitives/MediaSlot";
import PageInfo from "../PageInfo";

type PortfolioPageProps = {
  title: string;
  description: string;
  mediaSrc?: string;
  mediaShape?: "1:1" | "9:16" | "16:9" | "4:5" | "5:4";
}

export default function MediaRight_TextLeft({ title, description, mediaSrc, mediaShape }: PortfolioPageProps) {
  return (
    // a is the LEFT box, b is the RIGHT box
    <BaseTwoBoxes variant="cNarrow"
      a={ // Left box = Page Title and Description
        <div className="flex justify-center md:justify-center">
          <PageInfo title={title} description={description} align="left" yPlacement='center' />
        </div>
      }
      b={ // Right box = Media
        <div className="flex justify-center md:justify-end">
          <MediaSlotC src="/media/example.jpg" alt="Media" shape="1:1" align="right"/>
        </div>
      }
    />
  );
}
