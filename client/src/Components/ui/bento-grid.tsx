import { cn } from "../../lib/utils";

const getSeverityColor = (level: string) => {
  switch (level) {
    case "Low":
      return "bg-green-100 text-green-600";
    case "Medium":
      return "bg-yellow-100 text-yellow-600";
    case "High":
      return "bg-orange-100 text-orange-600";
    case "Critical":
      return "bg-red-100 text-red-500";
    default:
      return "bg-gray-100 text-gray-500";
  }
};

export const BentoGrid = ({ className, children }) => {
  return (
    <div
      className={cn(
        "mx-auto grid grid-cols-1 gap-5 md:auto-rows-[400px] md:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  data,
  navigation,
}) => {
  return (
    <div
      className={cn(
        "group/bento shadow-input row-span-1 flex flex-col justify-between space-y-4 rounded-xl border border-neutral-200 bg-white transition duration-200 hover:shadow-xl dark:border-white/[0.2] dark:bg-black dark:shadow-none",
        className,
        "h-[400px]" // <-- Change this value to your desired card height
      )}
    >
      <div className="transition duration-200  group-hover/bento:border-green-400 border-1">
        <img
          src={icon}
          alt={`Map showing location of ${data.Location || "this disaster"}`}
          className="w-full object-cover rounded-xl h-[230px]"
          loading="lazy"
        />

        <div className="flex flex-col justify-between h-[160px] ">
          <div className="flex flex-col justify-between">
            <div className="flex justify-between my-2 mx-5">
              <div className="font-sans font-bold text-neutral-600 dark:text-neutral-200">
                {title}
              </div>
              <div
                className={`flex h-[22px] mt-[2px] rounded px-5 justify-center text-center ${getSeverityColor(data.severityLevel)}`}
              >
                <div className="text-[13px] font-sans font-semibold">
                  {data.severityLevel}
                </div>
              </div>
            </div>
            <div className="font-sans mx-6 pt-2 text-left text-[12px] font-normal text-neutral-500 dark:text-neutral-300">
              {description.length > 110 ? (
                <>
                  {description.slice(0, 110)}...
                  <button
                    className="ml-2 px-2 py-1 text-xs bg-emerald-500 text-white rounded hover:bg-emerald-600 transition"
                    onClick={() => alert(description)}
                  >
                    Read More
                  </button>
                </>
              ) : (
                description
              )}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col">
            <div className="border-t border-neutral-200 dark:border-neutral-700 my-2 mx-5" />
            <div className="flex flex-row rounded-md justify-between mx-5  ">
              <div className="flex gap-3 items-center">
                <img
                  src={data.images}
                  alt="Profile_img"
                  className="rounded-full w-[30px] h-[30px] object-cover"
                />
                <div className="flex flex-col text-left text-[12px] font-normal text-neutral-500">
                  <span className="font-semibold text-neutral-600">Name</span>
                  <span>Grapihch Designer</span>
                </div>
              </div>
              <div className="flex flex-col text-right text-[12px] font-normal text-neutral-500">
                <div className="font-semibold text-neutral-600">Date</div>
                <span>2023-10-01</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
