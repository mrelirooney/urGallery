import React from "react";
import BaseOneBox from "../primitives/BaseOneBox";
import MediaSlot from "../primitives/MediaSlot";
import PageInfo from "../PageInfo";

type PortfolioPageProps = {
  title: string;
  description: string;
}

export default function AllMedia_NoText({ title, description }: PortfolioPageProps) {
  return (
    // a is the TOP box, b is the BOTTOM box
    <BaseOneBox
      a={ // Top box = Media
        <div className="flex justify-center md:justify-center">
          <PageInfo title={title} description={description} align="left" yPlacement='center' />
        </div>
      }
    />
  );
}