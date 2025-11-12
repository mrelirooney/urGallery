import React from 'react'
import PortfolioTitle from "../PortfolioTitle";
import PageMedia from "../PageMedia";
import Pagination from '../Pagination';
import PageInfo from '../PageInfo';


export default function MediaLeft_TextRight() {
  return (
    <div>
     
      <div className='flex md:grid md:grid-cols-2 '>
        {/* Media On Left */}
        <div className="flex flex-col justify-center md:text-left">
          <div className="h-120 w-120 overflow-hidden justify-center">
            <PageMedia />
          </div>
        </div>
        {/* Text On Right */}
        <div className="flex flex-col justify-center text-center md:text-left">
          <PageInfo/>
        </div>
      </div>
      
    </div>

  )
}
