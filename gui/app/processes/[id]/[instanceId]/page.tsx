import {
  ProcessDefinition,
  ProcessInstance,
  ProcessVariables,
} from "../../types";
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
  params: { instanceId },
}: {
  params: { instanceId: string };
}) => {
  const instance = await getInstance(instanceId);
  const variables = await getVariables(instanceId);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Instance</h2>
        <div className={styles.tabs}>
          <ul className={styles.tabsList}></ul>
        </div>
        <div className={styles.tools}></div>
      </div>
      <div className={styles.body}>
        <div className={styles.props}>
          <table className={styles.propsTable}>
            <tbody className={styles.propsTBody}>
              {Object.entries(instance).map(([key, value]) => {
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
          <Viewer process={instance.definitionId} className={styles.viewer} />
          <div className={styles.variables}>
            <table className={styles.variablesTable}>
              <tbody className={styles.variablesTBody}>
                {Object.entries(variables).map(([varKey, varValue]) => {
                  return (
                    <tr className={styles.variablesTBody} key={varKey}>
                      <th className={styles.variablesTH}>{varKey}</th>
                      <td className={styles.variablesTD}>{varValue.type}</td>
                      <td className={styles.variablesTD}>
                        {JSON.stringify(varValue.value)}
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

async function getInstance(id: string): Promise<ProcessInstance> {
  const res = await fetch(
    `http://localhost:3000/api/engine/process-instance/${id}`
  );

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error(`Failed to fetch data: ${res.statusText} [${res.status}]`);
  }

  const instance: ProcessInstance = await res.json();

  return instance;
}

async function getVariables(id: string): Promise<ProcessVariables> {
  const res = await fetch(
    `http://localhost:3000/api/engine/process-instance/${id}/variables`
  );

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error(`Failed to fetch data: ${res.statusText} [${res.status}]`);
  }

  const vars: ProcessVariables = await res.json();

  return vars;
}
