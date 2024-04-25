import { FC } from "react";
import styles from "./Navigation.module.scss";
import Link from "next/link";
import { FaDatabase, FaHome, FaProjectDiagram, FaList } from "react-icons/fa";
import { FaCodeBranch, FaUser } from "react-icons/fa6";
import clsx from "clsx";

export const Navigation: FC = () => {
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
            <Link href="/modeler" className={styles.link}>
              <span className={styles.icon}>
                <FaProjectDiagram />
              </span>
              <span className={styles.caption}>Modeler</span>
            </Link>
          </li>
          <li className={styles.item}>
            <Link href="/processes" className={styles.link}>
              <span className={styles.icon}>
                <FaDatabase />
              </span>
              <span className={styles.caption}>Processes</span>
            </Link>
          </li>
          <li className={styles.item}>
            <Link href="/tasks" className={styles.link}>
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
            <w3m-button />
          </li>
        </ul>
      </nav>
    </div>
  );
};
