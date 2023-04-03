"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";

import { IconButton } from "./button";
import styles from "./home.module.scss";

import SettingsIcon from "../icons/settings.svg";
import GithubIcon from "../icons/github.svg";
import ChatGptIcon from "../icons/chatgpt.svg";

import BotIcon from "../icons/bot.svg";
import AddIcon from "../icons/add.svg";
import LoadingIcon from "../icons/three-dots.svg";
import CloseIcon from "../icons/close.svg";

import {
  Message,
  SubmitKey,
  useChatStore,
  ChatSession,
  BOT_HELLO,
} from "../store";
import {
  copyToClipboard,
  downloadAs,
  isMobileScreen,
  selectOrCopy,
} from "../utils";
import Locale from "../locales";
import { ChatList } from "./chat-list";
import { Chat } from "./chat";

import dynamic from "next/dynamic";
import { REPO_URL } from "../constant";

export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={styles["loading-content"]}>
      {!props.noLogo && <BotIcon />}
      <LoadingIcon />
    </div>
  );
}

const Settings = dynamic(async () => (await import("./settings")).Settings, {
  loading: () => <Loading noLogo />,
});

function useSwitchTheme() {
  const config = useChatStore((state) => state.config);

  useEffect(() => {
    document.body.classList.remove("light");
    document.body.classList.remove("dark");

    if (config.theme === "dark") {
      document.body.classList.add("dark");
    } else if (config.theme === "light") {
      document.body.classList.add("light");
    }

    const themeColor = getComputedStyle(document.body)
      .getPropertyValue("--theme-color")
      .trim();
    const metaDescription = document.querySelector('meta[name="theme-color"]');
    metaDescription?.setAttribute("content", themeColor);
  }, [config.theme]);
}

const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};

export function CDKModal() {
  const [CDK, SetCDK] = useState("");
  let cdkdb = [
    {
      cdk: "jkljkljlk",
      time: "2022-01-01",
    },
    {
      cdk: "jkljkljlk2",
      time: "2022-01-01",
    },
    {
      cdk: "jkljkl1jlk",
      time: "2023-09-01",
    },
  ];
  const login = () => {
    let cdkArray = cdkdb.filter((item) => item.cdk === CDK);
    console.log(cdkArray);
    if (
      cdkArray.length > 0 &&
      new Date(cdkArray[0].time).getTime() > new Date().getTime()
    ) {
      window.localStorage.setItem("cdk", JSON.stringify(cdkArray[0]));
      document.getElementsByClassName("modal-mask")?.[0]?.remove();
      alert("登录成功");
    } else {
      alert("授权码失效或错误");
    }
  };
  let loaclcdk: any = window.localStorage.getItem("cdk");
  let time: any = JSON.parse(loaclcdk)?.time;
  if (!time || new Date(time).getTime() < new Date().getTime()) {
    window.localStorage.removeItem("cdk");
  }
  return !window.localStorage.getItem("cdk") ? (
    <div className="modal-mask">
      <div className={styles["modal-container"]}>
        <div className={styles["modal-header"]}>
          <div className={styles["modal-title"]}>授权码</div>
        </div>

        <div className={styles["modal-content"]}>
          <input
            className={styles["modal-input"]}
            onInput={(e) => SetCDK(e.currentTarget.value)}
            value={CDK}
          />
        </div>

        <div className={styles["modal-footer"]}>
          <div className={styles["modal-actions"]}>
            <IconButton
              icon={<AddIcon />}
              bordered
              text="确定"
              onClick={() => login()}
            />
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div></div>
  );
}

export function Home() {
  const [createNewSession, currentIndex, removeSession] = useChatStore(
    (state) => [
      state.newSession,
      state.currentSessionIndex,
      state.removeSession,
    ],
  );
  const loading = !useHasHydrated();
  const [showSideBar, setShowSideBar] = useState(true);

  // setting
  const [openSettings, setOpenSettings] = useState(false);
  const config = useChatStore((state) => state.config);

  useSwitchTheme();

  if (loading) {
    return <Loading />;
  }
  return (
    <div
      className={`${
        config.tightBorder && !isMobileScreen()
          ? styles["tight-container"]
          : styles.container
      }`}
    >
      <CDKModal />
      <div
        className={styles.sidebar + ` ${showSideBar && styles["sidebar-show"]}`}
      >
        <div className={styles["sidebar-header"]}>
          <div className={styles["sidebar-title"]}>ChatGPT Next</div>
          <div className={styles["sidebar-sub-title"]}>
            Build your own AI assistant.
          </div>
          <div className={styles["sidebar-logo"]}>
            <ChatGptIcon />
          </div>
        </div>

        <div
          className={styles["sidebar-body"]}
          onClick={() => {
            setOpenSettings(false);
            setShowSideBar(false);
          }}
        >
          <ChatList />
        </div>

        <div className={styles["sidebar-tail"]}>
          <div className={styles["sidebar-actions"]}>
            <div className={styles["sidebar-action"] + " " + styles.mobile}>
              <IconButton
                icon={<CloseIcon />}
                onClick={() => {
                  if (confirm(Locale.Home.DeleteChat)) {
                    removeSession(currentIndex);
                  }
                }}
              />
            </div>
            <div className={styles["sidebar-action"]}>
              <IconButton
                icon={<SettingsIcon />}
                onClick={() => {
                  setOpenSettings(true);
                  setShowSideBar(false);
                }}
                shadow
              />
            </div>
            <div className={styles["sidebar-action"]}>
              <a href={REPO_URL} target="_blank">
                <IconButton icon={<GithubIcon />} shadow />
              </a>
            </div>
          </div>
          <div>
            <IconButton
              icon={<AddIcon />}
              text={Locale.Home.NewChat}
              onClick={() => {
                createNewSession();
                setShowSideBar(false);
              }}
              shadow
            />
          </div>
        </div>
      </div>

      <div className={styles["window-content"]}>
        {openSettings ? (
          <Settings
            closeSettings={() => {
              setOpenSettings(false);
              setShowSideBar(true);
            }}
          />
        ) : (
          <Chat
            key="chat"
            showSideBar={() => setShowSideBar(true)}
            sideBarShowing={showSideBar}
          />
        )}
      </div>
    </div>
  );
}