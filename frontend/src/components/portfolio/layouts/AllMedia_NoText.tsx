import React from "react";
import BaseTwoBoxes from "../primitives/BaseTwoBoxes";
import MediaSlot from "../primitives/MediaSlot";
import PageInfo from "../PageInfo";

export default function AllMedia_NoText() {
  return (
    // a is the TOP box, b is the BOTTOM box
    <BaseTwoBoxes
      a={ // Top box = Media
        <div className="flex justify-center md:justify-start">
          <MediaSlot src="/media/example.jpg" alt="Media" shape="1:1" align="left"/>
        </div>
      }
      b={ // Bottom box = Page Title and Description
        <div className="flex justify-center md:justify-start">
          <PageInfo align="left" shape='1:1' yPlacement='center' />
        </div>
      }
    />
  );
}