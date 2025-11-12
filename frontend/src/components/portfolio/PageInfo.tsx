import React from 'react'
import PortfolioTitle from "./PortfolioTitle";
import PageDescription from './PageDescription';

export default function PageInfo() {
  return (
    <div>
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-neutral-200 pb-4">
        <PortfolioTitle/>
        </h1>
        <hr></hr>
        <PageDescription/>
    </div>
  )
}
