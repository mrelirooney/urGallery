import React from 'react'
import PageInfo from '../PageInfo';
import MediaSlot from '../primitives/MediaSlot';


export default function MediaLeft_TextRight() {
  return (
    <div>
     
      <div className='flex md:grid md:grid-cols-2 '>
        {/* Media On Left */}
        <div className="flex flex-col justify-center md:text-left">
          <div className="flex justify-center md:justify-start">
            <MediaSlot src="/media/example.jpg" alt="MediaGoesHere" shape="1:1" align="left" />
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
