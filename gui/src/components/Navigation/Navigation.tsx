"use client";

import { FC } from "react";
import styles from "./Navigation.module.scss";
import Link from "next/link";
import { FaDatabase, FaHome, FaProjectDiagram, FaList } from "react-icons/fa";
import { FaCodeBranch, FaUser } from "react-icons/fa6";
import clsx from "clsx";
import ConnectButton from "@/src/components/ConnectButton";
import { usePathname } from "next/navigation";

export const Navigation: FC = () => {
  const pathname = usePathname();

  return (
    <div className={styles.container}>
      <Link className={styles.link} href="/">
        <span className={styles.icon}>
          <FaHome />
        </span>
      </Link>
      <nav className={styles.sections}>
        <ul className={styles.list}>
          <li className={styles.item}>
            <Link
              href="/modeler"
              className={clsx(styles.link, {
                [styles.active]: pathname.startsWith("/modeler"),
              })}
            >
              <span className={styles.icon}>
                <FaProjectDiagram />
              </span>
              <span className={styles.caption}>Modeler</span>
            </Link>
          </li>
          <li className={styles.item}>
            <Link
              href="/processes"
              className={clsx(styles.link, {
                [styles.active]: pathname.startsWith("/processes"),
              })}
            >
              <span className={styles.icon}>
                <FaDatabase />
              </span>
              <span className={styles.caption}>Processes</span>
            </Link>
          </li>
          <li className={styles.item}>
            <Link
              href="/tasks"
              className={clsx(styles.link, {
                [styles.active]: pathname.startsWith("/tasks"),
              })}
            >
              <span className={styles.icon}>
                <FaList />
              </span>
              <span className={styles.caption}>Tasks</span>
            </Link>
          </li>
        </ul>
      </nav>
      <nav className={styles.personal}>
        <ul className={styles.list}>
          <li className={styles.item}>
            <ConnectButton />
          </li>
        </ul>
      </nav>
    </div>
  );
};
