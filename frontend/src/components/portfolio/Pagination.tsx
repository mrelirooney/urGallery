import React from 'react'
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination() {
  return (
    <div className='flex justify-end gap-x-6'>
        <div className='flex justify-between items-center gap-x-8'>
            <div>1</div>
            <div>2</div>
            <div>3</div>
            <div>4</div>
            <div>5</div>
            <div>6</div>
            <div>7</div>
            <div>8</div>
            <div>9</div>
            <div>10</div>
            <div>11</div>
            <div>12</div>
        </div>
        <div className='flex justify-end gap-x-4'>
            <button className="p-2 rounded-full hover:bg-neutral-700">
                <ChevronLeft size={24}/>
            </button>
            <button className="p-2 rounded-full hover:bg-neutral-700">
                <ChevronRight size={24}/>
            </button>
        </div>
    </div>
  )
}
