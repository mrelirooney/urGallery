import React from "react";
import BaseTwoBoxes from "../primitives/BaseTwoBoxes";
import MediaSlot from "../primitives/MediaSlot";
import PageInfo from "../PageInfo";

export default function MediaLeft_TextRight() {
  return (
    // a is the LEFT box, b is the RIGHT box
    <BaseTwoBoxes variant="cNarrow"
      a={ // Left box = Page Title and Description
        <div className="flex justify-center md:justify-center">
          <PageInfo align="left" shape='1:1' yPlacement='center' />
        </div>
      }
      b={ // Right box = Media
        <div className="flex justify-center md:justify-end">
          <MediaSlot src="/media/example.jpg" alt="Media" shape="9:16" align="right"/>
        </div>
      }
    />
  );
}
