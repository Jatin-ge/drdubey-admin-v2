interface TimeSelectorProps {
    times: string[]
}

const TimeSelector = ({times}: TimeSelectorProps) => {
    return ( <div>
         <div className="flex flex-wrap gap-4">
          {times?.map((time, i) => (
            <div key={`time-${i}`} className="rounded-sm bg-gray-100 p-2 ">
              <button
                type="button"
                onClick={() => {}}
              >
                {[]}
              </button>
            </div>
          ))}
        </div>
    </div> );
}
 
export default TimeSelector;