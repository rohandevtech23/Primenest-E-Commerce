import { redirect } from "next/navigation";

export default function WomenCategoryRedirect() {
  redirect("/shop?category=women");
}
