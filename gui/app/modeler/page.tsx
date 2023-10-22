import { FC, Suspense } from "react";
import styles from "./page.module.scss";
import dynamic from "next/dynamic";

const ModelerPage = dynamic(
  () => import("@/src/components/ModelerPage/ModelerPage"),
  {
    loading: () => <p>Loading...</p>,
    ssr: false,
  }
);

export default function ModelerStaticPage() {
  return (
    <Suspense>
      {/* @ts-expect-error Server Component */}
      <ModelerPage className={styles.container} />
    </Suspense>
  );
}
