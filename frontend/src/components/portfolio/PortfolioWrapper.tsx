"use client";

import React from "react";
import PortfolioTitle from "./primitives/PortfolioTitle";
import MediaLeft_TextRight from "./layouts/MediaLeft_TextRight";
import MediaRight_TextLeft from "./layouts/MediaRight_TextLeft";
import MediaTop_TextBottom from "./layouts/MediaTop_TextBottom";
import MediaBottom_TextTop from "./layouts/MediaBottom_TextTop";
import AllMedia_NoText from "./layouts/AllMedia_NoText";
import NoMedia_AllText from "./layouts/NoMedia_AllText";
import Pagination from "./primitives/Pagination";

// Props type — you can extend this later with actual data
type PortfolioWrapperProps = {
  children?: React.ReactNode;
};

export default function PortfolioWrapper({ children }: PortfolioWrapperProps) {
  return (
    <section className="mx-auto max-w-7xl flex-col justify-between text-neutral-100">
      {/* 🧱 Portfolio Wrapper Layout */}
      <div className="w-full max-w-7xl py-8 flex flex-col gap-6 justify-between">

        {/* Portfolio Title, PageInfo, PageMedia, Pagination, etc. will go here */}
        <PortfolioTitle text="Portfolio Title" align="left" size="xs" color="text-neutral-200" />
          <MediaTop_TextBottom/>
          {/*<MediaLeft_TextRight/>*/}
          {/*<MediaRight_TextLeft/> */}
          {/**/}
          {/*<MediaBottom_TextTop/>*/}
          {/*<AllMedia_NoText/>*/}
          {/*<NoMedia_AllText/>*/}
        <Pagination/>
      </div>
    </section>
  );
}
