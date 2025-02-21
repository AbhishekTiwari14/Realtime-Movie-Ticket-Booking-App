import { Crew } from "@/types"

export function DisplayProfile({
  name,
  id,
  profile_path,
  character,
  department,
}: Crew) {
  return (
    <div className="flex flex-col shadow-2xl rounded-lg w-[138px] h-[250px]">
      <div className="overflow-hidden rounded-t-xl w-full" key={id}>
        {profile_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w185${profile_path}`}
            alt="Crew Image"
            className="w-full h-44 object-cover"
          />
        ) : (
          <svg
            height="176px"
            width={"100%"}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              {" "}
              <path
                d="M8 7C9.65685 7 11 5.65685 11 4C11 2.34315 9.65685 1 8 1C6.34315 1 5 2.34315 5 4C5 5.65685 6.34315 7 8 7Z"
                fill="#9e9e9e"
              ></path>{" "}
              <path
                d="M14 12C14 10.3431 12.6569 9 11 9H5C3.34315 9 2 10.3431 2 12V15H14V12Z"
                fill="#9e9e9e"
              ></path>{" "}
            </g>
          </svg>
        )}
      </div>
      <div className="rounded-b-xl px-2 flex-1">
        <p className="p-1 font-bold text-center break-words">{name}</p>

        {character && (
          <p className="px-1 text-center text-sm break-words">{character}</p>
        )}
        {department && (
          <p className="px-1 text-center text-sm break-words">{department}</p>
        )}
      </div>
    </div>
  )
}
