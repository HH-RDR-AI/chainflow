import { getDefinition, getInstances } from "@/src/utils/processUtils";
import styles from "./page.module.scss";
import Viewer from "@/src/components/Viewer";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function InstancesPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const { process, instances } = await getData(id);

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
                        <Link href={`/processes/${process.id}/${instance.id}`}>
                          {instance.id}
                        </Link>
                      </th>
                      <td className={styles.instancesTD}>
                        {instance.ended ? "Ended" : "In progress"}{" "}
                        {instance.suspended ? "Suspended" : "Active"}
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
    process: await getDefinition(id),
    instances: await getInstances(id),
  };
}
