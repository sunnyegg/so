'use client';

import { useContext } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Coiny, Fira_Sans } from "next/font/google";

import { AuthContext, IAuthContext } from "@/context/auth";

import AuthButton from "../auth/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const coiny = Coiny({ subsets: ["latin"], weight: ["400"] });
const fira = Fira_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });

export default function TopBar() {
  const { auth } = useContext(AuthContext) as IAuthContext;

  const pathname = usePathname();
  const isActivePath = (path: string) => pathname === path ? 'bg-so-secondary-color rounded-md' : '';
  const isDashboardPath = () => pathname.startsWith("/dashboard");

  return (
    <section className={`flex items-center justify-between ${fira.className}`}>
      <Link
        href={"/"}
        className={`mx-auto md:mx-0 flex items-center justify-center text-[1.2rem] ${coiny.className}`}>
        <div>STREAM</div>
        <div className="text-so-accent-color">EGG</div>
      </Link>

      {!isDashboardPath() && <div className="hidden md:flex items-center gap-4">
        <Link
          href={"/support"}
          className={`p-2 hover:bg-so-secondary-color hover:rounded-md transition-all ${isActivePath("/support")}`}>
          SUPPORT
        </Link>
        <Link
          href={"/about"}
          className={`p-2 hover:bg-so-secondary-color hover:rounded-md transition-all ${isActivePath("/about")}`}>
          ABOUT
        </Link>
        <Link
          href={"/how-it-works"}
          className={`p-2 hover:bg-so-secondary-color hover:rounded-md transition-all ${isActivePath("/how-it-works")}`}>
          HOW IT WORKS?
        </Link>

        {auth.user.user_login !== "" ? (
          <Avatar>
            <AvatarImage src={auth.user.profile_image_url} alt={auth.user.user_login} />
            <AvatarFallback>{auth.user.user_login.charAt(0)}</AvatarFallback>
          </Avatar>
        ) : <AuthButton
          className="bg-transparent border-so-accent-color hover:bg-so-accent-color"
          variant={"outline"}>
          LOGIN
        </AuthButton>
        }
      </div>}

      {isDashboardPath() && (
        <>
          <div className="hidden md:flex items-center gap-4">
            <Link
              href={"/dashboard/shoutout"}
              className={`p-2 hover:bg-so-secondary-color hover:rounded-md transition-all ${isActivePath("/dashboard/shoutout")}`}>
              SHOUTOUT
            </Link>
            <Link
              href={"/dashboard/attendance"}
              className={`p-2 hover:bg-so-secondary-color hover:rounded-md transition-all ${isActivePath("/dashboard/support")}`}>
              ATTENDANCE
            </Link>
            <Link
              href={"/dashboard/settings"}
              className={`p-2 hover:bg-so-secondary-color hover:rounded-md transition-all ${isActivePath("/dashboard/support")}`}>
              SETTINGS
            </Link>
          </div>

          <Avatar>
            <AvatarImage src={auth.user.profile_image_url} alt={auth.user.user_login} />
            <AvatarFallback>{auth.user.user_login.charAt(0)}</AvatarFallback>
          </Avatar>
        </>
      )}
    </section>
  );
}