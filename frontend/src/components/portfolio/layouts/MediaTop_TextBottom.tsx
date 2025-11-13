import React from "react";
import BaseTwoColumns , { BaseTwoRows } from "../primitives/BaseTwoBoxes";
import MediaSlotC , { MediaSlotR } from "../primitives/MediaSlot";
import PageInfo from "../PageInfo";

export default function MediaLeft_TextRight() {
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
          <PageInfo align="left" shape='1:1' yPlacement='center' />
        </div>
      }
    />
  );
}