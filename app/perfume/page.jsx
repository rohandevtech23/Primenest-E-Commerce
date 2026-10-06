import { redirect } from "next/navigation";

export default function PerfumeCategoryRedirect() {
  redirect("/shop?category=perfume");
}
