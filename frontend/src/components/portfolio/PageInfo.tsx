import React from 'react'
import PageTitle from "./primitives/PageTitle";
import PageDescription from './primitives/PageDescription';

export default function PageInfo() {
  return (
    <div>
        <div className="pb-4">
          <PageTitle text="Portfolio Title" align="left" size="lg" color="text-neutral-200" />
        </div>
        <hr></hr>
        <div className="pt-4">
          <PageDescription text="Lorem Ipsum" align="left" size="sm" color="text-neutral-200" />
        </div>
    </div>
  )
}
