"use client";

import { useContext } from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Coiny, Fira_Sans } from "next/font/google";

import { AuthContext, IAuthContext } from "@/context/auth";

import AuthButton from "../auth/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import useLogout from "@/hooks/auth/use-logout";

import browserStorage from "store";

const coiny = Coiny({ subsets: ["latin"], weight: ["400"] });
const fira = Fira_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export default function TopBar() {
  const { auth } = useContext(AuthContext) as IAuthContext;

  const pathname = usePathname();
  const isActivePath = (path: string) =>
    pathname === path ? "bg-so-secondary-color rounded-md" : "";
  const isDashboardPath = () => pathname && pathname.startsWith("/dashboard");
  const router = useRouter();

  const handleLogout = () => {
    useLogout(auth.refresh_token);
    browserStorage.clearAll();
    router.push("/");
  };

  return (
    <section className={`flex items-center justify-between ${fira.className}`}>
      <Link
        href={"/"}
        className={`mx-auto flex items-center justify-center text-[1.2rem] md:mx-0 ${coiny.className}`}
      >
        <div>STREAM</div>
        <div className="text-so-accent-color">EGG</div>
      </Link>

      {!isDashboardPath() && (
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href={"/support"}
            className={`p-2 transition-all hover:rounded-md hover:bg-so-secondary-color ${isActivePath("/support")}`}
          >
            SUPPORT
          </Link>
          <Link
            href={"/about"}
            className={`p-2 transition-all hover:rounded-md hover:bg-so-secondary-color ${isActivePath("/about")}`}
          >
            ABOUT
          </Link>
          <Link
            href={"/how-it-works"}
            className={`p-2 transition-all hover:rounded-md hover:bg-so-secondary-color ${isActivePath("/how-it-works")}`}
          >
            HOW IT WORKS?
          </Link>

          {auth.user.user_login !== "" ? (
            <Avatar>
              <AvatarImage
                src={auth.user.profile_image_url}
                alt={auth.user.user_login}
              />
              <AvatarFallback>{auth.user.user_login.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <AuthButton variant="streamegg-outline">LOGIN</AuthButton>
          )}
        </div>
      )}

      {isDashboardPath() && (
        <>
          <div className="hidden items-center gap-4 md:flex">
            <Link
              href={"/dashboard/shoutout"}
              className={`p-2 transition-all hover:rounded-md hover:bg-so-secondary-color ${isActivePath("/dashboard/shoutout")}`}
            >
              SHOUTOUT
            </Link>
            <Link
              href={"/dashboard/attendance"}
              className={`p-2 transition-all hover:rounded-md hover:bg-so-secondary-color ${isActivePath("/dashboard/support")}`}
            >
              ATTENDANCE
            </Link>
            <Link
              href={"/dashboard/settings"}
              className={`p-2 transition-all hover:rounded-md hover:bg-so-secondary-color ${isActivePath("/dashboard/support")}`}
            >
              SETTINGS
            </Link>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild className="cursor-pointer">
              <Avatar>
                <AvatarImage
                  src={auth.user.profile_image_url}
                  alt={auth.user.user_login}
                />
                <AvatarFallback>
                  {auth.user.user_login.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>{auth.user.user_name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </section>
  );
}
