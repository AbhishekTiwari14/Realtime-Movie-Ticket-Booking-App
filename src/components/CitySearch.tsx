"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useLocation } from "../hooks/useLocation"

const frameworks = [
  {
    value: "Mumbai",
    label: "Mumbai",
  },
  {
    value: "Delhi",
    label: "Delhi",
  },
  {
    value: "Kolkata",
    label: "Kolkata",
  },
  {
    value: "Indore",
    label: "Indore",
  },
  {
    value: "Lucknow",
    label: "Lucknow",
  },
]

export function CitySearch() {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const { userLocation } = useLocation()

  if (userLocation) console.log("Lat:", userLocation.latitude)

  return (
    <>
      <h1>Hi {userLocation && userLocation.latitude}</h1>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {value
              ? frameworks.find((framework) => framework.value === value)?.label
              : "Select City"}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search framework..." />
            <CommandList>
              <CommandEmpty>No framework found.</CommandEmpty>
              <CommandGroup>
                {/* <CommandItem
                value="Locate City"
                onSelect={() => {
                  locateCity()
                  setValue(city)
                  console.log("city: ", city)
                  setOpen(false)
                }}
              >
                {"Locate City"}
                <Check
                  className={cn(
                    "ml-auto",
                    value === city ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem> */}
                {frameworks.map((framework) => (
                  <CommandItem
                    key={framework.value}
                    value={framework.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue)
                      setOpen(false)
                    }}
                    onClick={useLocation}
                  >
                    {framework.label}
                    <Check
                      className={cn(
                        "ml-auto",
                        value === framework.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  )
}
