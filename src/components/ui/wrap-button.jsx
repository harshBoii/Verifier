import React from "react"
import Link from "next/link"
import { ArrowRight, Globe } from "lucide-react"

import { cn } from "@/lib/utils"
import { FiPlus } from "react-icons/fi"

const WrapButton = ({
  className,
  children,
  href,
  onClick
}) => {
  return (
    <div className="flex items-center justify-center">
      {href ? (
        <Link href={href}>
          <div
          onClick={onClick}
            className={cn(
              "group cursor-pointer border group border-[#fff4f4] bg-[#ffffff] gap-2  h-[64px] flex items-center p-[11px] rounded-full",
              className
            )}>
            <div
              className="border border-[#f5eded] bg-[#ff3f17]  h-[43px] rounded-full flex items-center justify-center text-white">
              <p
                className="font-medium tracking-tight mr-3 ml-2 flex items-center gap-2 justify-center ">
                {children}
              </p>
            </div>
            <div
              className="text-[#3b3a3a] group-hover:ml-2  ease-in-out transition-all size-[26px] flex items-center justify-center rounded-full border-2 border-[#3b3a3a]  ">
              <ArrowRight size={18} className="group-hover:rotate-45 ease-in-out transition-all " />
            </div>
          </div>
        </Link>
      ) : (
        <div
        onClick={onClick}
          className={cn(
            "group cursor-pointer border group border-[#fff2f2] bg-[#1980ff] gap-2  h-[64px] flex items-center p-[11px] rounded-full",
            className
          )}>
          <div
            className="border border-[#669cff] bg-[#fafafa]  h-[43px] rounded-full flex items-center justify-center text-black">
            <Globe className="mx-2 animate-spin " />
            <p className="font-medium tracking-tight mr-3">
              {children ? children : "Add Skills"}
            </p>
          </div>
          <div
            className="text-[#3b3a3a] group-hover:ml-2  ease-in-out transition-all size-[26px] flex items-center justify-center rounded-full border-2 border-[#3b3a3a]  ">
            <FiPlus size={18} className="group-hover:rotate-45 ease-in-out transition-all bg-zinc-600 text-white rounded-4xl " />
          </div>
        </div>
      )}
    </div>
  );
}

export default WrapButton
