import { ProcessDefinition } from "./types";
import styles from "./page.module.scss";
import {
  FaCheck,
  FaCircle,
  FaCircleCheck,
  FaCircleXmark,
  FaCross,
  FaPlay,
  FaStop,
} from "react-icons/fa6";
import Viewer from "@/src/components/Viewer";

export const ProjectsPage = async () => {
  const processes = await getDefinitions();

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
                <div className={styles.entry}>
                  <a
                    href={`/processes/${process.id}`}
                    className={styles.entryHeader}
                  >
                    {process.name}
                  </a>
                  <div className={styles.entryBody}>
                    <Viewer
                      process={process.id}
                      className={styles.entryViewer}
                    />
                  </div>
                  <div className={styles.entryFooter}>
                    {process.instanceCount || "No"} instances
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ProjectsPage;

export async function getDefinitions(): Promise<ProcessDefinition[]> {
  const res = await fetch(
    "http://localhost:3000/api/engine/process-definition"
  );

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error(`Failed to fetch data: ${res.statusText} [${res.status}]`);
  }

  const processes: ProcessDefinition[] = await res.json();

  await Promise.all(
    processes.map(async (process, idx) => {
      processes[idx].instanceCount = await getInstanceCount(process.id);
    })
  );

  return processes;
}

async function getInstanceCount(id: string): Promise<number> {
  const res = await fetch(
    `http://localhost:3000/api/engine/process-instance/count?processDefinitionId=${id}`
  );

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error(`Failed to fetch data: ${res.statusText} [${res.status}]`);
  }

  const { count } = await res.json();

  return count;
}
