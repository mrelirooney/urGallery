import React from "react";
import BaseTwoColumns , { BaseTwoRows } from "../primitives/BaseTwoBoxes";
import MediaSlotC , { MediaSlotR } from "../primitives/MediaSlot";
import PageInfo from "../PageInfo";

type PortfolioPageProps = {
  title: string;
  description: string;
  mediaSrc?: string;
  mediaShape?: "1:1" | "9:16" | "16:9" | "4:5" | "5:4";
}

export default function MediaTop_TextBottom({ title, description, mediaSrc, mediaShape }: PortfolioPageProps) {
  return (
    // a is the TOP box, b is the BOTTOM box
    <BaseTwoRows variant="topHeavy"
      a={ // Top box = Media
        <div className="flex justify-center items-center">
          <div className="w-full max-w-[100vw] flex justify-center items-center">
            <MediaSlotR src="/media/example.jpg" alt="Media" shape="1:1" align="left"/>
          </div>
        </div>
      }
      b={ // Bottom box = Page Title and Description
        <div className="flex items-center">
          <PageInfo title={title} description={description} align="left" yPlacement='center' />
        </div>
      }
    />
  );
}