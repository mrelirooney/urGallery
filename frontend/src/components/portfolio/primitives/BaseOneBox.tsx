import React from "react";

type BaseOneBoxProps = {
  a: React.ReactNode;
};

export default function BaseOneBox({ a }: BaseOneBoxProps) {

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full items-center">
      <div className={`h-full w-full`}>{a}</div>
    </div>
  );
}

