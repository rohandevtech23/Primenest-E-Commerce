import { redirect } from "next/navigation";

export default function FootwearCategoryRedirect() {
  redirect("/shop?category=footwear");
}
