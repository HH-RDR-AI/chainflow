import { getInstance, getVariables } from "@/src/utils/processUtils";
import { ProcessInstance, ProcessVariables } from "../../types";
import styles from "./page.module.scss";
import Viewer from "@/src/components/Viewer";

export const dynamic = "force-dynamic";

export default async function InstancePage({
  params: { instanceId },
}: {
  params: { instanceId: string };
}) {
  const { instance, variables } = await getData(instanceId);

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
}

async function getData(id: string) {
  return {
    instance: await getInstance(id),
    variables: await getVariables(id),
  };
}
