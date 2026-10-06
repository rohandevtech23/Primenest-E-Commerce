import { redirect } from "next/navigation";

export default function AccessoriesCategoryRedirect() {
  redirect("/shop?category=accessories");
}
