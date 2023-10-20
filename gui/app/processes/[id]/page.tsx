import { ProcessDefinition, ProcessInstance } from "../types";
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

export const InstancesPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const process = await getDefinition(id);
  const instances = await getInstances(id);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Process</h2>
        <div className={styles.tabs}>
          <ul className={styles.tabsList}></ul>
        </div>
        <div className={styles.tools}></div>
      </div>
      <div className={styles.body}>
        <div className={styles.props}>
          <table className={styles.propsTable}>
            <tbody className={styles.propsTBody}>
              {Object.entries(process).map(([key, value]) => {
                return (
                  <tr className={styles.propsTR} key={key}>
                    <th className={styles.propsTH}>{key}</th>
                    <td className={styles.propsTD}>{value}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className={styles.content}>
          <Viewer process={process.id} className={styles.viewer} />
          <div className={styles.instances}>
            <table className={styles.instancesTable}>
              <tbody className={styles.instancesTBody}>
                {instances.map((instance) => {
                  return (
                    <tr className={styles.instancesTBody}>
                      <th className={styles.instancesTH}>
                        <a href={`/processes/${process.id}/${instance.id}`}>
                          {instance.id}
                        </a>
                      </th>
                      <td className={styles.instancesTD}>
                        {instance.ended ? "Ended" : "In progress"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstancesPage;

export async function getInstances(id: string): Promise<ProcessInstance[]> {
  const res = await fetch(
    `http://localhost:3000/api/engine/process-instance?processDefinitionId=${id}`
  );

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error(`Failed to fetch data: ${res.statusText} [${res.status}]`);
  }

  const instances: ProcessInstance[] = await res.json();

  return instances;
}

export async function getDefinition(id: string): Promise<ProcessDefinition> {
  const res = await fetch(
    `http://localhost:3000/api/engine/process-definition?processDefinitionId=${id}`
  );

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error(`Failed to fetch data: ${res.statusText} [${res.status}]`);
  }

  const processes: ProcessDefinition[] = await res.json();

  return processes[0];
}
