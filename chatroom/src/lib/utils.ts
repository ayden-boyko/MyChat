//external
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/*
merges multiple CSS class names into a single string. 
It uses clsx to combine the classes and twMerge to handle Tailwind CSS utility classes
*/
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
