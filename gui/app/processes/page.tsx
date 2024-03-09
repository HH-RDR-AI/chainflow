import styles from "./page.module.scss";
import { getDefinitions } from "@/src/utils/processUtils";
import Link from "next/link";
import Button from "@/src/components/Button";
import { FaPlay } from "react-icons/fa6";

export default async function ProjectsPage() {
  const processes = await getData();

  const handleNewInstance = () => {
    //
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Processes</h1>
        <div className={styles.tools}></div>
      </div>
      <div className={styles.body}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Instances</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {processes?.map((process, idx) => {
              return (
                <tr key={idx}>
                  <td>
                    <Link
                      href={`/processes/${process.id}`}
                      className={styles.title}
                    >
                      {process.name}
                    </Link>
                  </td>
                  <td>
                    {process.instanceCount || "No"} instance
                    {!process?.instanceCount || process?.instanceCount > 1
                      ? "s"
                      : ""}
                  </td>
                  <td>
                    {/* <Button
                      icon={<FaPlay />}
                      caption="New Instance"
                      disabled
                      onClick={handleNewInstance}
                    /> */}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

async function getData() {
  return await getDefinitions();
}
