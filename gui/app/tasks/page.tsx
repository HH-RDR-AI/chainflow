import styles from "./page.module.scss";
import { Tasks } from "@/src/components/Tasks/Tasks";

export default async function TasksPage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Tasks</h2>
        <div className={styles.tools}></div>
      </div>
      <Tasks className={styles.body} />
    </div>
  );
}
