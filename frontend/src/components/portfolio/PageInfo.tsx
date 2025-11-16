import React from "react";
import PageTitle from "./primitives/PageTitle";
import PageDescription from "./primitives/PageDescription";

type PageInfoProps = {
  title: string;
  description: string;
  shape?: "1:1" | "4:5" | "9:16" | "5:4" | "16:9";
  align?: "left" | "center" | "right";
  yPlacement?: "center" | "top" | "bottom";
};

export default function PageInfo({
  title,
  description,
  shape = "1:1",
  align = "left",
  yPlacement = "center",
}: PageInfoProps) {
  // Width based on shape (you can tweak this later)
  const widthClass = "w-full";

  // Vertical placement of the text block
  const yTextPlacementClass =
    yPlacement === "top"
      ? "flex flex-col justify-start"
      : yPlacement === "center"
      ? "flex flex-col justify-center"
      : "flex flex-col justify-end";

  // Horizontal text alignment
  const alignClass =
    align === "center"
      ? "text-center items-center"
      : align === "right"
      ? "text-right items-end"
      : "text-left items-start";

  return (
    <div className={`h-full ${widthClass}`}>
      <div className={`${yTextPlacementClass} ${alignClass} h-full`}>
        {/* Title */}
        <div className="w-full">
          <PageTitle text={title} size="lg" color="text-neutral-200" />
        </div>

        {/* Separator line */}
        <div className="h-px w-full bg-neutral-700" />

        {/* Description */}
        <div className="w-full max-w-xl">
          <PageDescription
            text={description}
            size="sm"
            color="text-neutral-200"
          />
        </div>
      </div>
    </div>
  );
}
