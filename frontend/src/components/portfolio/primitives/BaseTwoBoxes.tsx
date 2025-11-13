import React from "react";

type BaseTwoBoxesProps = {
  a: React.ReactNode;
  b: React.ReactNode;
  variant?: "equal" | "aNarrow" | "bNarrow" | "cNarrow" | "dNarrow" | "topHeavy" | "bottomHeavy" | "empty" | "full";
};

export default function BaseTwoColumns({ a, b, variant = "equal" }: BaseTwoBoxesProps) {
  const aWidthClass = 
  variant === "aNarrow" ? "md:basis-1/3" :
  variant === "bNarrow" ? "md:basis-2/5" : 
                          "md:basis-1/2" ;

  const bWidthClass = 
  variant === "aNarrow" ? "md:basis-2/3" :
  variant === "bNarrow" ? "md:basis-3/5" : 
                          "md:basis-1/2" ; 

  const cWidthClass = 
  variant === "cNarrow" ? "md:basis-2/3" :
  variant === "dNarrow" ? "md:basis-3/5" : 
                          "md:basis-1/2" ;
  const dWidthClass = 
  variant === "cNarrow" ? "md:basis-1/3" :
  variant === "dNarrow" ? "md:basis-2/5" : 
                          "md:basis-1/2" ;

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full items-center">
      <div className={`h-full ${aWidthClass}`}>{a}</div>
      <div className={`h-full ${bWidthClass}`}>{b}</div>
    </div>
  );
}

export function BaseTwoRows({ a, b, variant = "topHeavy"}: BaseTwoBoxesProps) {
  const aHeightClass = 
  variant === "topHeavy"    ? "md:basis-2/3" :      // media = 2/3 page
  variant === "bottomHeavy" ? "md:basis-1/3" :
                              "md:basis-1/2" ;     // fallback 50/50

  const bHeightClass =
  variant === "topHeavy"    ? "md:basis-1/3" :      // text = 1/3 page
  variant === "bottomHeavy" ? "md:basis-2/3" :
                              "md:basis-1/2";
  return (
    <div className="flex flex-row md:flex-col gap-6 h-full items-center">
      <div className={`w-full ${aHeightClass}`}>{a}</div>
      <div className={`w-full ${bHeightClass}`}>{b}</div>
    </div>
  );
}

