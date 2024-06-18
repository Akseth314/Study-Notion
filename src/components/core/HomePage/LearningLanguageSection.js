import React from 'react'
import HighlightText from './HighlightText'
import Know_your_progress from "../../../assets/Images/Know_your_progress.png";
import Compare_with_others from "../../../assets/Images/Compare_with_others.svg";
import Plan_your_lessons from "../../../assets/Images/Plan_your_lessons.svg";
import CTAButton from "../../../components/core/HomePage/Button";

export default function LearningLanguageSection() {
  return (
    <div className='mt-[150px]'>
        <div className='flex flex-col gap-1'>
            <div className='text-4xl font-semibold text-center'>
                Your swiss knife for{" "}
                <HighlightText text={"learning any language"}/>
            </div>
            <div className='text-center text-richblack-600 font-medium lg:w-[75%] mx-auto leading-6 text-base mt-3'>
                Using spin making learning multiple languages easy. with 20+
                languages realistic voice-over, progress tracking, custom schedule
                and more.
            </div>
            {/* image */}
            <div className='flex flex-col lg:flex-row items-center justify-center mt-5 lg:mt-0'>
                <img
                src={Know_your_progress}
                alt='KnowYourProgress'
                className='object-contain lg:-mr-32'
                />
                <img
                src={Compare_with_others}
                alt='CompareWithOthers'
                className='object-contain lg:-mb-10 lg:-mt-0 -mt-12'
                />
                <img
                src={Plan_your_lessons}
                alt='PlanYourLessons'
                className='object-contain lg:-ml-36 lg:-mt-5 -mt-16'
                />
            </div>
            {/* button */}
            <div className='w-fit mx-auto lg:mb-20 mb-8 mt-16 '>
                <CTAButton active={true} linkto={"/signup"}>
                    Learn More
                </CTAButton>
            </div>
        </div>
    </div>
  )
}
