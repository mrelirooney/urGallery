import React from "react";
import MediaLeft_TextRight from "./layouts/MediaLeft_TextRight";
import MediaRight_TextLeft from "./layouts/MediaRight_TextLeft";
import MediaTop_TextBottom from "./layouts/MediaTop_TextBottom";
import MediaBottom_TextTop from "./layouts/MediaBottom_TextTop";
import AllMedia_NoText from "./layouts/AllMedia_NoText";
import NoMedia_AllText from "./layouts/NoMedia_AllText";

export type LayoutType = 
  | "MediaLeft_TextRight"
  | "MediaRight_TextLeft"
  | "MediaTop_TextBottom"
  | "MediaBottom_TextTop"
  | "AllMedia_NoText"
  | "NoMedia_AllText";

export type MediaShapeType = "1:1" | "9:16" | "16:9" | "4:5" | "5:4";

// Define what data a page needs
export type PortfolioPageData = {
  layoutType: LayoutType;
  title: string;
  description: string;
  mediaSrc?: string;
  mediaShape?: MediaShapeType;
};

type PageRendererProps = {
  page: PortfolioPageData;
};

export default function PageRenderer({ page }: PageRendererProps) {
  const { layoutType, title, description, mediaSrc, mediaShape } = page;

  switch (layoutType) {
    case "MediaLeft_TextRight":
      return (
        <MediaLeft_TextRight title={title} description={description} mediaSrc={mediaSrc} mediaShape={mediaShape}/>
      );

    case "MediaRight_TextLeft":
      return (
        <MediaRight_TextLeft title={title} description={description} mediaSrc={mediaSrc} mediaShape={mediaShape}/>
      );

    case "MediaTop_TextBottom":
      return (
        <MediaTop_TextBottom title={title} description={description} mediaSrc={mediaSrc} mediaShape={mediaShape}/>
      );

    case "MediaBottom_TextTop":
      return (
        <MediaBottom_TextTop title={title} description={description} mediaSrc={mediaSrc} mediaShape={mediaShape}/>
      );

    case "AllMedia_NoText":
      return <AllMedia_NoText mediaSrc={mediaSrc} mediaShape={mediaShape} />;

    case "NoMedia_AllText":
      return <NoMedia_AllText title={title} description={description} />;

    default:
      return (
        <div className="text-center p-8 text-red-500">
          Unknown layout: <b>{layoutType}</b>
        </div>
      );
  }
}
