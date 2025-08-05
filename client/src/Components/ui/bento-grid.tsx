import { cn } from "../../lib/utils";
import profile_pic from "../../assets/Profile_Pic.jpg";

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
        "mx-auto grid grid-cols-1 gap-5 md:auto md:grid-cols-3",
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
  type,
  navigation,
  approveDisaster,
  rejectDisaster,
}) => {
  return (
    <div
      className={cn(
        "group/bento shadow-input row-span-1 flex flex-col justify-between  rounded-xl border border-neutral-200 bg-white transition duration-200 hover:shadow-xl dark:border-white/[0.2] dark:bg-black dark:shadow-none",
        className,
        "h-[430px]" // <-- Change this value to your desired card height
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
            <div className="font-sans mx-6 pt-2 h-full min-h-[50px] text-left text-[12px] font-normal text-neutral-500 dark:text-neutral-300">
              {description.length > 110 ? (
                <>
                  {description.slice(0, 110)}...
                  <button
                    className="ml-2 py-1 text-xs text-emerald-500 font-semibold  transition"
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
                  src={data.userImage || profile_pic} // fallback to default if not available
                  alt="User Profile"
                  className="rounded-full w-[30px] h-[30px] object-cover"
                />
                <div className="flex flex-col text-left text-[12px] font-normal text-neutral-400">
                  <span className="font-semibold text-[13px] text-neutral-600">
                    {data.user || "UnKnown"}
                  </span>
                  <span>{data.email || "Anonymous User"}</span>
                </div>
              </div>
              <div className="flex flex-col text-right text-[12px] font-normal text-neutral-400">
                <div className="font-semibold text-neutral-600">Date</div>
                <span>
                  {data.date
                    ? new Date(data.date).toISOString().split("T")[0]
                    : ""}
                </span>{" "}
              </div>
            </div>

            {type === "admin" && (
              <>
                <div className="border-t  border-neutral-200 dark:border-neutral-700 my-2 mx-5" />
                {data.status === "Pending" ? (
                  <div className="flex gap-2 text-left w-full justify-end pr-4 text-[13px]">
                    <button
                      onClick={() => approveDisaster(data._id)}
                      className="px-3  border h-[28px] border-green-400 text-green-500 rounded-md hover:border-green-400 hover:bg-green-100 hover:text-green-500 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => rejectDisaster(data._id)}
                      className="px-3  border h-[28px] border-red-500 text-red-500 rounded-md hover:bg-red-100 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <div className="flex mt-1 items-center text-[12px] h-auto  font-normal text-neutral-500 ml-5  justify-en">
                    Disaster Post Status : {data.status}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
