import { FC } from "react";
import styles from "./Navigation.module.scss";
import Link from "next/link";
import { FaDatabase, FaHome, FaProjectDiagram, FaList } from "react-icons/fa";
import { FaCodeBranch, FaUser } from "react-icons/fa6";
import clsx from "clsx";
import ConnectButton from "@/src/components/ConnectButton";
import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';

export const Navigation: FC = () => {
  return (
    <div className={styles.container}>
      <Link className={styles.logo} href="/">
        <span className={styles.logoIcon}>
          <FaHome />
        </span>
      </Link>
      <nav className={clsx(styles.navigation, styles.sections)}>
        <ul className={styles.navigationList}>
          <li className={styles.navigationItem}>
            <Link href="/modeler" className={styles.navigationLink}>
              <span className={styles.navigationLinkIcon}>
                <FaProjectDiagram />
              </span>
              <span className={styles.navigationLinkCaption}>Modeler</span>
            </Link>
          </li>
          <li className={styles.navigationItem}>
            <Link href="/processes" className={styles.navigationLink}>
              <span className={styles.navigationLinkIcon}>
                <FaDatabase />
              </span>
              <span className={styles.navigationLinkCaption}>Processes</span>
            </Link>
          </li>
          <li className={styles.navigationItem}>
            <Link href="/tasks" className={styles.navigationLink}>
              <span className={styles.navigationLinkIcon}>
                <FaList />
              </span>
              <span className={styles.navigationLinkCaption}>Tasks</span>
            </Link>
          </li>
        </ul>
      </nav>
      <nav className={clsx(styles.navigation, styles.personal)}>
        <ul className={styles.navigationList}>
          <li className={styles.navigationItem}>
            <ConnectButton />
            <RainbowConnectButton />
          </li>
        </ul>
      </nav>
    </div>
  );
};
