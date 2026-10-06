import { redirect } from "next/navigation";

export default function MenCategoryRedirect() {
  redirect("/shop?category=men");
}
