import React from "react";
import BaseTwoBoxes from "../primitives/BaseTwoBoxes";
import MediaSlotC , { MediaSlotR } from "../primitives/MediaSlot";
import PageInfo from "../PageInfo";

export default function MediaLeft_TextRight() {
  return (
    // a is the LEFT box, b is the RIGHT box
    <BaseTwoBoxes variant="equal"
      a={ // Left box = Media
        <div className="flex justify-center md:justify-start">
          <MediaSlotC src="/media/example.jpg" alt="Media" shape="1:1"/>
        </div>
        
      }
      b={ // Right box = Page Title and Description
        <div className="flex justify-center md:justify-start">
          <PageInfo align="left" yPlacement='center' />
        </div>
      }
    />
  );
}
