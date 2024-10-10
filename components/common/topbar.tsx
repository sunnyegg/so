"use client";

import { memo, useState } from "react";

import Link from "next/link";
import { Coiny, Fira_Sans } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";

import { Check } from "lucide-react";

import LoginButton from "./login-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import usePersistState from "@/hooks/use-persist-state";

import { Auth } from "@/types/auth";
import { PersistAuth } from "@/types/persist";
import { ModeratedChannel, SelectedChannel } from "@/types/channel";

const coiny = Coiny({ subsets: ["latin"], weight: ["400"] });
const fira = Fira_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

type TopBarProps = {
  handleLogout: () => void;
  moderatedChannels: ModeratedChannel[];
  channel: SelectedChannel;
  setChannel: React.Dispatch<React.SetStateAction<SelectedChannel>>;
};

function TopBar(props: TopBarProps) {
  const { handleLogout, moderatedChannels, channel, setChannel } = props;

  const pathname = usePathname();
  const isActivePath = (path: string) =>
    pathname === path ? "bg-so-secondary-color rounded-md" : "";
  const isDashboardPath = () => pathname && pathname.startsWith("/dashboard");

  const router = useRouter();

  const [auth] = usePersistState(
    PersistAuth.name,
    PersistAuth.defaultValue
  ) as [Auth];

  const handleChangeChannel = (channel: SelectedChannel) => {
    setChannel(channel);
    router.refresh();
  };

  return (
    <section className={`flex items-center justify-between ${fira.className}`}>
      <Link
        href={auth.accessToken ? "/dashboard/shoutout" : "/"}
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

          {auth.user ? (
            <Avatar>
              <AvatarImage
                src={auth.user.profileImageUrl}
                alt={auth.user.login}
              />
              <AvatarFallback>{auth.user.login.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <LoginButton variant="streamegg-outline" text="Login" />
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
              className={`p-2 transition-all hover:rounded-md hover:bg-so-secondary-color ${isActivePath("/dashboard/attendance")}`}
            >
              ATTENDANCE
            </Link>
            <Link
              href={"/dashboard/settings"}
              className={`p-2 transition-all hover:rounded-md hover:bg-so-secondary-color ${isActivePath("/dashboard/settings")}`}
            >
              SETTINGS
            </Link>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild className="cursor-pointer">
              <Avatar>
                <AvatarImage
                  src={channel?.profileImageUrl}
                  alt={channel?.login}
                />
                <AvatarFallback>{channel.login?.charAt(0)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mt-2 bg-so-secondary-color text-so-primary-text-color">
              <DropdownMenuLabel>{channel?.displayName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Change Channel</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="bg-so-secondary-color text-so-primary-text-color">
                    <DropdownMenuItem
                      onClick={() =>
                        handleChangeChannel({
                          id: auth.user?.id,
                          login: auth.user?.login,
                          displayName: auth.user?.displayName,
                          profileImageUrl: auth.user?.profileImageUrl,
                        })
                      }
                    >
                      <ChannelItem
                        current={channel.login}
                        login={auth.user?.login}
                        displayName="My Channel"
                      />
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {moderatedChannels &&
                      moderatedChannels.length &&
                      moderatedChannels.map((ch) => {
                        return (
                          <DropdownMenuItem
                            key={ch.id}
                            onClick={() =>
                              handleChangeChannel({
                                id: ch.id,
                                login: ch.login,
                                displayName: ch.displayName,
                                profileImageUrl: ch.profileImageUrl,
                              })
                            }
                          >
                            <ChannelItem
                              current={channel.login}
                              login={ch.login}
                              displayName={ch.displayName}
                            />
                          </DropdownMenuItem>
                        );
                      })}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </section>
  );
}

const ChannelItem = ({
  current,
  login,
  displayName,
}: {
  current: string;
  login: string;
  displayName: string;
}) => {
  return (
    <>
      {displayName} {current === login && <Check className="ml-2" size={16} />}
    </>
  );
};

export default memo(TopBar);
