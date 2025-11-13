import React from 'react'
import PageTitle from "./primitives/PageTitle";
import PageDescription from './primitives/PageDescription';

type MediaSlotProps = {
  shape?: "1:1" | "4:5" | "9:16" | "5:4" | "16:9";
  align?: "left" | "center" | "right";
  yPlacement?: "center" | "top" | "bottom";
};

export default function PageInfo({shape = "1:1", align = "left", yPlacement="center"}: MediaSlotProps){
  const widthClass =
    shape === "1:1"  ? "w-full" :  "w-[w-full]";

    const yTextPlacementClass =
    yPlacement === "top"     ?  "flex flex-col justify-start" :
    yPlacement === "center"  ?  "flex flex-col justify-center" :
                                "flex flex-col justify-end" ;
    
    const alignClass =
    align === "center" ? "text-center" :
    align === "right"  ? "text-right" :
                         "text-left";

  return (
    <div className={`h-full ${widthClass}`}>
      <div className={`${yTextPlacementClass} ${alignClass} h-full`}>
        <div className={`pb-4 ${alignClass}`}>
          <PageTitle text="Portfolio Title" size="lg" color="text-neutral-200" />
        </div>
        <hr className="border-neutral-500 my-2" />
        <div className="pt-4">
          <PageDescription text="Lorem Ipsum" size="sm" color="text-neutral-200" />
        </div>
      </div>
    </div>
    
  )
}
