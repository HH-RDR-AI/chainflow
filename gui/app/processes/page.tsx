import styles from "./page.module.scss";
import ProcessCard from "@/src/components/ProcessCard";
import { getDefinitions } from "@/src/utils/processUtils";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const processes = await getData();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Processes</h2>
        <div className={styles.tools}></div>
      </div>
      <div className={styles.body}>
        <ul className={styles.list}>
          {processes?.map((process) => {
            return (
              <li className={styles.item} key={process.key}>
                <ProcessCard process={process} />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

async function getData() {
  return await getDefinitions();
}
