import { FC, ReactNode } from "react";
import styles from "./Panel.module.scss";
import clsx from "clsx";

type PanelProps = {
  className?: string;
  title: ReactNode;
  tools?: ReactNode | ReactNode[];
  children?: ReactNode | ReactNode[];
};

export const Panel: FC<PanelProps> = ({
  title,
  tools,
  className,
  children,
}) => {
  return (
    <div className={clsx(styles.container, className)}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {!!tools && <div className={styles.tools}>{tools}</div>}
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
};
