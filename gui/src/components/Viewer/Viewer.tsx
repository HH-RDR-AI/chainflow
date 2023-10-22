"use client";

import { FC, useRef, useEffect } from "react";

import "camunda-bpmn-js/dist/assets/camunda-platform-viewer.css";
import BpmnViewer from "bpmn-js/lib/Viewer";

import styles from "./Viewer.module.scss";
import clsx from "clsx";

export const Viewer: FC<{ process: string; className?: string }> = ({
  process,
  className,
}) => {
  const refCanvas = useRef<HTMLDivElement>(null);
  const refViewer = useRef<BpmnViewer | null>(null);

  useEffect(() => {
    if (!refCanvas.current || refViewer.current) {
      return;
    }

    const viewer = new BpmnViewer({
      container: refCanvas.current || "",
    });
    refViewer.current = viewer;

    const getXml = async () => {
      try {
        const res = await fetch(
          `https://chainflow.dexguru.biz/dashboard/api/engine/process-definition/${process}/xml`
        );

        if (!res.ok) {
          return;
        }

        const { bpmn20Xml } = await res.json();
        await viewer?.importXML(bpmn20Xml);
        const canvas = viewer.get("canvas") as any;
        canvas.zoom("fit-viewport");
      } catch (e) {
        console.error(e);
      }
    };

    getXml();
  }, [refCanvas]);

  return <div className={clsx(styles.container, className)} ref={refCanvas} />;
};
