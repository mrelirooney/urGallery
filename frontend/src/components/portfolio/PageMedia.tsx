import React from 'react'

export default function PageMedia() {
  return (
    <div className="justify-self-center md:justify-self-start h-115 w-115 shadow-sm">
          <img
            src="/profile.png"
            alt="Media Goes Here"
            className="object-cover w-full h-full bg-neutral-200"
          />
    </div>
  )
}
