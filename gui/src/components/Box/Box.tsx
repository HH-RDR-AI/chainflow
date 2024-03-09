import { FC, ReactNode } from "react";
import styles from "./Box.module.scss";
import clsx from "clsx";

type BoxProps = {
  className?: string;
  children?: ReactNode | ReactNode[];
};

export const Box: FC<BoxProps> = ({ className, children }) => {
  return <div className={clsx(styles.container, className)}>{children}</div>;
};
