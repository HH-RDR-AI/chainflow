import { FC } from "react";
import styles from "./Navigation.module.scss";
import Link from "next/link";
import { FaDatabase, FaHome, FaProjectDiagram, FaList } from "react-icons/fa";

export const Navigation: FC = () => {
  return (
    <div className={styles.container}>
      <Link className={styles.logo} href="/">
        <span className={styles.logoIcon}>
          <FaHome />
        </span>
      </Link>
      <nav className={styles.sections}>
        <ul className={styles.sectionsList}>
          <li className={styles.sectionsItem}>
            <Link href="/modeler" className={styles.sectionsLink}>
              <span className={styles.sectionsLinkIcon}>
                <FaProjectDiagram />
              </span>
              <span className={styles.sectionsLinkCaption}>Modeler</span>
            </Link>
          </li>
          <li className={styles.sectionsItem}>
            <Link href="/projects" className={styles.sectionsLink}>
              <span className={styles.sectionsLinkIcon}>
                <FaDatabase />
              </span>
              <span className={styles.sectionsLinkCaption}>Processes</span>
            </Link>
          </li>
          <li className={styles.sectionsItem}>
            <Link href="/tasks" className={styles.sectionsLink}>
              <span className={styles.sectionsLinkIcon}>
                <FaList />
              </span>
              <span className={styles.sectionsLinkCaption}>Tasks</span>
            </Link>
          </li>
        </ul>
      </nav>
      <nav className={styles.aside}></nav>
    </div>
  );
};
