import { FC, ReactNode } from "react";
import styles from "./List.module.scss";
import clsx from "clsx";

type ListProps = {
  className?: string;
  children?: ReactNode | ReactNode[];
};

export const List: FC<ListProps> = ({ className, children }) => {
  const data = Array.isArray(children) ? children : [children];

  return (
    <div className={clsx(styles.container, className)}>
      <ul className={styles.list}>
        {data.map((item, idx) => (
          <li key={idx} className={styles.item}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};
